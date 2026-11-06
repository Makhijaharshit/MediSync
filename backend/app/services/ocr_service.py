import os
import io
import logging
from typing import Dict, List, Any, Tuple
from PIL import Image
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

# Ensure paddlex cache directories point inside the workspace to avoid permission issues
workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
paddlex_cache = os.path.join(workspace_root, ".paddlex")
os.environ["PADDLE_PDX_CACHE_HOME"] = paddlex_cache
os.environ["PADDLE_HOME"] = os.path.join(workspace_root, ".paddle")
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.makedirs(paddlex_cache, exist_ok=True)

# Lazy initialization of PaddleOCR engine
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from paddleocr import PaddleOCR
            _ocr_engine = PaddleOCR(lang="en")
            logger.info("PaddleOCR engine initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {e}")
            raise RuntimeError(f"PaddleOCR engine initialization failed: {e}")
    return _ocr_engine


def _parse_paddle_output(ocr_output: Any) -> Tuple[List[str], List[float]]:
    """
    Extracts text lines and confidence scores from various PaddleOCR result formats.
    """
    lines: List[str] = []
    scores: List[float] = []

    if not ocr_output:
        return lines, scores

    for item in ocr_output:
        # Format 1: dict with 'rec_texts' and 'rec_scores' (PaddleOCR 3.7+ predict)
        if isinstance(item, dict):
            if "rec_texts" in item:
                texts = item.get("rec_texts", [])
                item_scores = item.get("rec_scores", [])
                lines.extend(texts)
                scores.extend(item_scores)
            elif "res" in item and isinstance(item["res"], dict):
                texts = item["res"].get("rec_text", []) or item["res"].get("rec_texts", [])
                item_scores = item["res"].get("rec_score", []) or item["res"].get("rec_scores", [])
                lines.extend(texts)
                scores.extend(item_scores)

        # Format 2: classic list of [[box, (text, score)], ...]
        elif isinstance(item, list):
            for entry in item:
                if isinstance(entry, (list, tuple)) and len(entry) >= 2:
                    text_score = entry[1]
                    if isinstance(text_score, (list, tuple)) and len(text_score) >= 2:
                        txt = str(text_score[0]).strip()
                        try:
                            sc = float(text_score[1])
                        except Exception:
                            sc = 0.95
                        if txt:
                            lines.append(txt)
                            scores.append(sc)

    return lines, scores


class OCRService:
    """
    PaddleOCR + PyMuPDF 300 DPI Medical OCR Service.
    No mock responses, no placeholders.
    """

    ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

    @classmethod
    def validate_file(cls, file_path: str) -> None:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_size = os.path.getsize(file_path)
        if file_size > cls.MAX_FILE_SIZE:
            raise ValueError(f"File size ({file_size} bytes) exceeds maximum 20 MB limit.")

        ext = os.path.splitext(file_path)[1].lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file format '{ext}'. Supported: PDF, PNG, JPG, JPEG")

    @classmethod
    def process_document(cls, file_path: str) -> Dict[str, Any]:
        """
        Processes a PDF or image file:
        - Renders PDF pages at 300 DPI with PyMuPDF
        - Runs PaddleOCR on each page in order
        - Returns concatenated text, page details, and average confidence
        """
        cls.validate_file(file_path)
        ext = os.path.splitext(file_path)[1].lower()
        ocr = get_ocr_engine()

        pages_data = []
        full_text_chunks = []
        all_confidences = []

        if ext == ".pdf":
            try:
                pdf_doc = fitz.open(file_path)
            except Exception as e:
                raise ValueError(f"Corrupt or unreadable PDF: {e}")

            if len(pdf_doc) == 0:
                raise ValueError("PDF document has 0 pages.")

            for page_index in range(len(pdf_doc)):
                page_num = page_index + 1
                page = pdf_doc[page_index]

                # Render at 300 DPI (72 DPI base -> 300/72 scale factor)
                zoom = 300.0 / 72.0
                matrix = fitz.Matrix(zoom, zoom)
                pixmap = page.get_pixmap(matrix=matrix)

                # Save temporary page image for PaddleOCR
                temp_page_img = os.path.join(paddlex_cache, f"temp_page_{page_num}_{os.path.basename(file_path)}.png")
                pixmap.save(temp_page_img)

                try:
                    ocr_res = ocr.ocr(temp_page_img)
                    lines, scores = _parse_paddle_output(ocr_res)
                finally:
                    if os.path.exists(temp_page_img):
                        try:
                            os.remove(temp_page_img)
                        except Exception:
                            pass

                page_text = "\n".join(lines).strip()
                page_avg_conf = sum(scores) / len(scores) if scores else 0.0

                pages_data.append({
                    "page_number": page_num,
                    "text": page_text,
                    "lines": lines,
                    "confidence": round(page_avg_conf, 4)
                })

                if page_text:
                    full_text_chunks.append(f"--- Page {page_num} ---\n{page_text}")
                    all_confidences.extend(scores)

            pdf_doc.close()

        else:
            # Image file (PNG, JPG, JPEG)
            try:
                # Validate image with Pillow
                with Image.open(file_path) as img:
                    img.verify()
            except Exception as e:
                raise ValueError(f"Invalid or corrupt image: {e}")

            ocr_res = ocr.ocr(file_path)
            lines, scores = _parse_paddle_output(ocr_res)
            img_text = "\n".join(lines).strip()
            avg_conf = sum(scores) / len(scores) if scores else 0.0

            pages_data.append({
                "page_number": 1,
                "text": img_text,
                "lines": lines,
                "confidence": round(avg_conf, 4)
            })

            if img_text:
                full_text_chunks.append(img_text)
                all_confidences.extend(scores)

        concatenated_text = "\n\n".join(full_text_chunks).strip()
        overall_confidence = (
            sum(all_confidences) / len(all_confidences) if all_confidences else 0.0
        )

        if not concatenated_text:
            raise ValueError("OCR extraction produced empty text. Document may be blank or unreadable.")

        return {
            "ocr_text": concatenated_text,
            "pages": pages_data,
            "overall_confidence": round(overall_confidence, 4),
            "page_count": len(pages_data),
        }

ocr_service = OCRService()
