"""
auth.py — CaseCraftAI authentication & role-based access control.

Exposes:
  router              FastAPI router: POST /auth/login, GET /auth/me
  get_current_user     dependency: resolves + validates the bearer JWT
  require_role(*roles) dependency factory: 403s unless user.role is allowed

Mount in main.py with:
  app.include_router(auth.router, prefix="/auth", tags=["auth"])
"""

import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from database.database import get_user_by_police_code, verify_password
from models.users import Role, User
from app.schemas.users import LoginRequest, TokenResponse, UserOut

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not set. Add it to backend/.env — see .env for "
        "generation instructions."
    )

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


# --------------------------------------------------------------------------
# Token helpers
# --------------------------------------------------------------------------

def create_access_token(user: User) -> tuple[str, int]:
    """Returns (token, expires_in_seconds)."""
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": user.id,
        "police_code": user.police_code,
        "name": user.name,
        "role": user.role.value,   # <-- this is what middleware.ts reads
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token, int(expires_delta.total_seconds())


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --------------------------------------------------------------------------
# Dependencies
# --------------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserOut:
    """Resolves the caller from the Authorization: Bearer <token> header."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)

    return UserOut(
        id=payload["sub"],
        name=payload["name"],
        police_code=payload["police_code"],
        role=Role(payload["role"]),
    )


def require_role(*allowed_roles: Role):
    """
    Dependency factory for route-level RBAC, e.g.:

        @router.post("/complaints/{id}/close")
        def close_case(user: UserOut = Depends(require_role(Role.SHO))):
            ...
    """
    def dependency(current_user: UserOut = Depends(get_current_user)) -> UserOut:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role '{current_user.role.value}' is not permitted to "
                    f"perform this action."
                ),
            )
        return current_user
    return dependency


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = get_user_by_police_code(body.police_code)

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect police code or password",
        )

    if body.role is not None and body.role != user.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                f"This account is registered as {user.role.value}, not "
                f"{body.role.value}. Select the correct role tab and try again."
            ),
        )

    token, expires_in = create_access_token(user)

    return TokenResponse(
        access_token=token,
        expires_in=expires_in,
        user=UserOut(
            id=user.id,
            name=user.name,
            police_code=user.police_code,
            role=user.role,
            email=user.email,
        ),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user