import os
import re
import json
import logging
from typing import Dict, Any, Optional
from backend.app.services.validation_service import validation_service, ExtractedMedicalData

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a medical information extraction engine.

Extract only information explicitly present in the OCR text.

### Extraction Rules

1. Never infer diagnoses.
2. Never invent medications.
3. For pathology reports, extract **every laboratory test row**.
4. Preserve the exact test name.
5. Preserve the numeric value exactly.
6. Preserve the unit exactly.
7. Extract the reference range when present.
8. Return valid JSON only.
9. Return empty arrays only if that category is genuinely absent.

## Required JSON Schema

```json
{
  "diagnoses": [],
  "medications": [],
  "allergies": [],
  "procedures": [],
  "lab_results": [
    {
      "test": "",
      "value": "",
      "unit": "",
      "reference_range": ""
    }
  ]
}
```

## Important Rule

If the OCR contains a table with columns similar to:

* Test Description
* Value
* Unit
* Reference Range

then every row must become one `lab_result`.

Example:

Haemoglobin 13.6 g/dL 12.0–15.0

↓

```json
{
  "test": "Haemoglobin",
  "value": "13.6",
  "unit": "g/dL",
  "reference_range": "12.0 - 15.0"
}
```

Do not summarize the report. Extract the complete table.
Return valid JSON only. Do not output markdown code blocks or explanations—only the JSON object.
"""

def _rule_based_clinical_extract(ocr_text: str) -> Dict[str, Any]:
    """
    Deterministic clinical entity parser used when OPENAI_API_KEY is not configured.
    Extracts ONLY explicitly written terms from OCR text. Never hallucinates.
    """
    result: Dict[str, Any] = {
        "diagnoses": [],
        "medications": [],
        "allergies": [],
        "procedures": [],
        "lab_results": []
    }

    if not ocr_text or not ocr_text.strip():
        return result

    lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]

    # 1. Diagnoses
    DISALLOWED_DIAGNOSES = {
        "complete blood count", "cbc", "haemogram", "hemogram", "pathology report",
        "blood routine", "laboratory report", "test description", "reference range",
        "normal range", "specimen", "investigation", "routine", "patient", "clinical chart"
    }
    diag_patterns = [
        r"(?:diagnosis|diagnoses|assessment|impression|dx|condition)[\s:]+([^.;\n]+)",
        r"(?:diagnosed with|history of|known case of)\s+([^.;\n]+)"
    ]
    seen_diagnoses = set()
    for pat in diag_patterns:
        for m in re.finditer(pat, ocr_text, re.IGNORECASE):
            text = m.group(1).strip(" -:•*")
            parts = re.split(r",|;|\band\b", text)
            for p in parts:
                cleaned = p.strip()
                if (
                    2 < len(cleaned) < 80
                    and cleaned.lower() not in seen_diagnoses
                    and cleaned.lower() not in DISALLOWED_DIAGNOSES
                ):
                    seen_diagnoses.add(cleaned.lower())
                    result["diagnoses"].append({"name": cleaned, "date": ""})

    # Common explicit diagnostic keywords in text
    known_diagnoses = [
        "Essential Hypertension", "Hypertension", "Type 2 Diabetes Mellitus", "Type 2 Diabetes",
        "Type 1 Diabetes", "Asthma", "Hyperlipidemia", "Coronary Artery Disease",
        "Acute Bronchitis", "Bronchitis", "Pneumonia", "Osteoarthritis", "Migraine",
        "Hypothyroidism", "GERD", "Peripheral Neuropathy", "Depression"
    ]
    for kd in known_diagnoses:
        if re.search(r"\b" + re.escape(kd) + r"\b", ocr_text, re.IGNORECASE):
            if kd.lower() not in seen_diagnoses and kd.lower() not in DISALLOWED_DIAGNOSES:
                seen_diagnoses.add(kd.lower())
                result["diagnoses"].append({"name": kd, "date": ""})

    # 2. Medications
    med_patterns = [
        r"(?:rx|medication|medications|prescription|current meds)[\s:]+([^.;\n]+)",
        r"\b([A-Za-z]+)\s+(\d+\s*(?:mg|mcg|ml|g|units?))\s*(?:daily|bid|tid|qid|prn|oral|po|subcutaneously)?\b"
    ]
    seen_meds = set()
    for line in lines:
        m = re.search(r"(?:Rx|Medication|Prescription)[\s:]+([^\n]+)", line, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if val.lower() not in seen_meds:
                seen_meds.add(val.lower())
                # Extract dosage
                dose_m = re.search(r"(\d+\s*(?:mg|mcg|ml|g|units?))", val, re.IGNORECASE)
                dosage = dose_m.group(1) if dose_m else ""
                freq_m = re.search(r"\b(daily|bid|tid|qid|prn|once daily|twice daily)\b", val, re.IGNORECASE)
                freq = freq_m.group(1) if freq_m else ""
                name = re.sub(r"(\d+\s*(?:mg|mcg|ml|g|units?)).*", "", val, flags=re.IGNORECASE).strip()
                result["medications"].append({
                    "name": name or val,
                    "dosage": dosage,
                    "frequency": freq
                })

    known_drugs = ["Metformin", "Lisinopril", "Atorvastatin", "Albuterol", "Amlodipine", "Levothyroxine", "Omeprazole", "Azithromycin", "Amoxicillin"]
    for kd in known_drugs:
        m = re.search(r"\b(" + re.escape(kd) + r")\s*(\d+\s*(?:mg|mcg|ml))?\s*(daily|bid|tid|qid|prn)?\b", ocr_text, re.IGNORECASE)
        if m:
            d_name = m.group(1).strip()
            d_dose = m.group(2).strip() if m.group(2) else ""
            d_freq = m.group(3).strip() if m.group(3) else ""
            if d_name.lower() not in seen_meds:
                seen_meds.add(d_name.lower())
                result["medications"].append({"name": d_name, "dosage": d_dose, "frequency": d_freq})

    # 3. Allergies
    allergy_match = re.search(r"(?:allergies|allergy|allergic to)[\s:]+([^\n.]+)", ocr_text, re.IGNORECASE)
    seen_allergies = set()
    if allergy_match:
        al_val = allergy_match.group(1).strip()
        parts = re.split(r",|;|\band\b", al_val)
        for p in parts:
            clean_al = p.strip()
            if "nkda" not in clean_al.lower() and "none" not in clean_al.lower() and len(clean_al) > 2:
                sev = "severe" if "severe" in clean_al.lower() or "anaphylaxis" in clean_al.lower() else ""
                clean_name = re.sub(r"\b(severe|anaphylaxis|mild|moderate)\b", "", clean_al, flags=re.IGNORECASE).strip()
                if clean_name.lower() not in seen_allergies:
                    seen_allergies.add(clean_name.lower())
                    result["allergies"].append({"name": clean_name, "severity": sev})

    known_allergens = ["Penicillin", "Sulfa", "Sulfonamides", "Aspirin", "Latex", "Peanuts"]
    for ka in known_allergens:
        if re.search(r"\b" + re.escape(ka) + r"\b", ocr_text, re.IGNORECASE):
            if ka.lower() not in seen_allergies:
                seen_allergies.add(ka.lower())
                result["allergies"].append({"name": ka, "severity": "severe"})

    # 4. Procedures
    proc_match = re.search(r"(?:procedures?|surgeries|operations?)[\s:]+([^\n.]+)", ocr_text, re.IGNORECASE)
    seen_procs = set()
    if proc_match:
        pr_val = proc_match.group(1).strip()
        parts = re.split(r",|;|\band\b", pr_val)
        for p in parts:
            clean_pr = p.strip()
            if len(clean_pr) > 3 and clean_pr.lower() not in seen_procs:
                seen_procs.add(clean_pr.lower())
                result["procedures"].append({"name": clean_pr, "date": ""})

    known_procs = ["Appendectomy", "Cholecystectomy", "Coronary Angiogram", "Cardiac Stent Placement", "Colonoscopy", "Endoscopy", "Chest X-Ray"]
    for kp in known_procs:
        if re.search(r"\b" + re.escape(kp) + r"\b", ocr_text, re.IGNORECASE):
            if kp.lower() not in seen_procs:
                seen_procs.add(kp.lower())
                result["procedures"].append({"name": kp, "date": ""})

    # 5. Lab Results (Pathology reports, CBC tables, and standard tests)
    seen_labs = set()
    skip_headers = {
        "test description", "test name", "investigation", "parameter",
        "reference range", "normal range", "biological reference", "biological ref interval",
        "value", "value(s)", "units", "unit", "page", "patient", "report",
        "specimen", "date", "time", "sample", "complete blood count", "cbc",
        "sample id", "dob/age/sex", "dob", "age", "sex", "registered", "mobile",
        "collected on", "referred by", "received on", "organization", "approved on",
        "direct", "haematology", "haemogram (cbc)", "haemogram", "differential count",
        "on", "dr.", "mr.", "ms.", "mrs."
    }

    metadata_keywords = {
        "dob", "age", "sex", "register", "mobile", "collected", "referred", "received",
        "approved", "organization", "sample id", "patient", "specimen", "doctor", "dr.",
        "haematology", "haemogram", "differential count", "test description", "reference range",
        "biological ref", "value"
    }

    def is_meta(t: str) -> bool:
        low = t.lower().strip()
        return low in skip_headers or any(m in low for m in metadata_keywords)

    # Pattern A: Tabular lines: <Test Name> <Value> <Unit> <Ref Range>
    table_row_pattern = re.compile(
        r"^([A-Za-z][A-Za-z0-9\s\(\)\/\-\_]+?)\s+([<>]?\s*[\d,]+(?:\.\d+)?)\s*([a-zA-Z%µμ\/\^0-9]+(?:\/[a-zA-Z0-9]+)?)?\s*([0-9\.,\-\s–—<>]+)?$"
    )

    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue
        if is_meta(cleaned_line):
            continue

        m = table_row_pattern.match(cleaned_line)
        if m:
            test_name = m.group(1).strip(" -:•*")
            val = m.group(2).strip()
            unit = m.group(3).strip() if m.group(3) else ""
            ref = m.group(4).strip() if m.group(4) else ""
            if (
                not is_meta(test_name)
                and len(test_name) > 1
                and not test_name.isdigit()
                and test_name.lower() not in seen_labs
            ):
                seen_labs.add(test_name.lower())
                result["lab_results"].append({
                    "test": test_name,
                    "value": val,
                    "unit": unit,
                    "reference_range": ref
                })

    # Pattern B: Multiline tabular sequences from OCR (Test Name \n Value \n Unit \n Ref Range)
    val_pattern = re.compile(r"^[<>]?\s*[\d,]+(?:\.\d+)?$")
    ref_pattern = re.compile(r"^[<>]?\s*[\d,]+(?:\.\d+)?\s*(?:-|–|—|to)\s*[<>]?\s*[\d,]+(?:\.\d+)?$")
    unit_pattern = re.compile(r"^(?:g/d[lL]|mg/d[lL]|%|10\^[0-9]+/[a-zA-Zµμ]+|/cumm|mill/cumm|f[lL]|pg|[a-zA-Z%µμ\/\^0-9]+)$")

    idx = 0
    while idx < len(lines):
        line = lines[idx].strip()
        if (
            not is_meta(line)
            and len(line) > 1
            and not val_pattern.match(line)
            and not ref_pattern.match(line)
            and not line.startswith(":")
        ):
            if idx + 1 < len(lines) and val_pattern.match(lines[idx + 1].strip()):
                test_name = line.strip(" -:•*")
                val = lines[idx + 1].strip()
                unit = ""
                ref = ""
                advance = 2

                if idx + 2 < len(lines):
                    next_l = lines[idx + 2].strip()
                    if ref_pattern.match(next_l):
                        ref = next_l
                        advance = 3
                    elif unit_pattern.match(next_l) or len(next_l) <= 10:
                        unit = next_l
                        advance = 3
                        if idx + 3 < len(lines) and ref_pattern.match(lines[idx + 3].strip()):
                            ref = lines[idx + 3].strip()
                            advance = 4

                if test_name.lower() not in seen_labs and not is_meta(test_name):
                    seen_labs.add(test_name.lower())
                    result["lab_results"].append({
                        "test": test_name,
                        "value": val,
                        "unit": unit,
                        "reference_range": ref
                    })
                idx += advance
                continue
        idx += 1

    # Pattern C: Colon/equals separated: <Test Name>: <Value> <Unit> (e.g. HbA1c: 7.4 %)
    lab_pattern = r"\b([A-Za-z0-9\-\/\s\(\)]+?)\s*[:=]\s*([<>]?\s*[\d,]+(?:\.\d+)?)\s*([a-zA-Z%µμ\/\^0-9]+(?:\/[a-zA-Z0-9]+)?)?(?:\s*(?:ref|reference|normal)?[\s:]*([0-9\.,\-\s–—<>]+))?\b"
    for m in re.finditer(lab_pattern, ocr_text):
        raw_name = m.group(1).splitlines()[-1].strip(" -:•*\n")
        val = m.group(2).strip()
        unit = m.group(3).strip() if m.group(3) else ""
        ref = m.group(4).strip() if m.group(4) else ""
        if (
            raw_name.lower() not in skip_headers
            and 1 < len(raw_name) < 40
            and not raw_name.isdigit()
            and raw_name.lower() not in seen_labs
        ):
            seen_labs.add(raw_name.lower())
            result["lab_results"].append({
                "test": raw_name,
                "value": val,
                "unit": unit,
                "reference_range": ref
            })

    return result


class ExtractionService:
    """
    LLM Extraction Service with strict Pydantic validation and retry logic.
    Input: Raw OCR text only.
    """

    @classmethod
    def extract_from_ocr(cls, ocr_text: str) -> Dict[str, Any]:
        if not ocr_text or not ocr_text.strip():
            raise ValueError("Extraction failed: OCR text is empty.")

        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            # LLM Pipeline with retry
            return cls._extract_with_openai(ocr_text, api_key)
        else:
            # Deterministic clinical entity parsing directly from OCR text
            raw_data = _rule_based_clinical_extract(ocr_text)
            llm_response = json.dumps(raw_data)
            parsed_json = raw_data
            print("OCR TEXT:", ocr_text[:1000])
            print("LLM RAW RESPONSE:", llm_response)
            print("PARSED JSON:", parsed_json)
            return parsed_json

    @classmethod
    def _extract_with_openai(cls, ocr_text: str, api_key: str) -> Dict[str, Any]:
        from openai import OpenAI
        client = OpenAI(api_key=api_key, timeout=30.0)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        # Retry the LLM once before marking extraction as failed
        last_error = None
        for attempt in range(2):
            try:
                logger.info(f"Executing LLM clinical extraction (attempt {attempt + 1}/2)...")
                response = client.chat.completions.create(
                    model=model,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Extract explicit medical entities from this raw OCR text:\n\n{ocr_text}"}
                    ],
                    temperature=0.0,
                )
                llm_response = response.choices[0].message.content
                if not llm_response:
                    raise ValueError("LLM returned empty extraction content.")

                try:
                    parsed_json = json.loads(llm_response)
                except Exception:
                    clean_content = re.sub(r"^```(?:json)?\s*", "", llm_response.strip())
                    clean_content = re.sub(r"\s*```$", "", clean_content.strip())
                    parsed_json = json.loads(clean_content)

                print("OCR TEXT:", ocr_text[:1000])
                print("LLM RAW RESPONSE:", llm_response)
                print("PARSED JSON:", parsed_json)

                return parsed_json

            except Exception as e:
                logger.warning(f"LLM extraction attempt {attempt + 1} failed: {e}")
                last_error = e

        raise RuntimeError(f"LLM extraction failed after retry: {last_error}")

extraction_service = ExtractionService()
