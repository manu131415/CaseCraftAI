from pydantic import BaseModel, EmailStr
from models.users import Role


class LoginRequest(BaseModel):
    police_code: str
    password: str
    # Optional: the role the user selected on the login screen. If provided,
    # we verify it matches the account's actual role — this catches an SHO
    # accidentally trying to log in through the "Legal Advisor" tab and lets
    # the frontend show a precise error instead of a generic auth failure.
    role: Role | None = None


class UserOut(BaseModel):
    id: str
    name: str
    police_code: str
    role: Role
    email: EmailStr | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut