"""add complaint_type and ai_summary to complaints

Revision ID: 006
Revises: 005
Create Date: 2026-07-11 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    # Add complaint_type column if missing
    op.add_column('complaints', sa.Column('complaint_type', sa.String(), nullable=True))
    # Add ai_summary column
    op.add_column('complaints', sa.Column('ai_summary', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('complaints', 'ai_summary')
    op.drop_column('complaints', 'complaint_type')
