import os
import logging
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.core.security import hash_password
from backend.app.models.models import User, AuditLog

logger = logging.getLogger(__name__)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@medsync.io")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password123")
ADMIN_NAME = os.getenv("ADMIN_NAME", "System Administrator")

def seed_admin_user(db: Session) -> User:
    """
    Seeds only the single admin account as mandated by CONSTRAINTS.md.
    No mock patient profiles, no mock timeline events.
    """
    admin_user = db.query(User).filter(User.email == ADMIN_EMAIL.lower()).first()
    if not admin_user:
        admin_user = User(
            email=ADMIN_EMAIL.lower(),
            password_hash=hash_password(ADMIN_PASSWORD),
            full_name=ADMIN_NAME,
            role="admin",
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        initial_audit = AuditLog(
            actor_id=admin_user.id,
            actor_email=admin_user.email,
            action="SYSTEM_INITIALIZED",
            details="Initial admin account seeded into PostgreSQL.",
        )
        db.add(initial_audit)
        db.commit()
        logger.info(f"Admin account created: {admin_user.email}")
    else:
        logger.info(f"Admin account already exists: {admin_user.email}")

    return admin_user

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_admin_user(db)
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
    print("Database initialization and admin seeding completed.")
