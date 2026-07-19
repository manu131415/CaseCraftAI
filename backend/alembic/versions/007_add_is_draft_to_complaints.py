"""add is_draft column to complaints table

Revision ID: 007
Revises: 006
Create Date: 2026-07-19 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_draft column to complaints table with default value True
    op.add_column(
        'complaints',
        sa.Column(
            'is_draft',
            sa.Boolean(),
            nullable=False,
            server_default='true'
        )
    )


def downgrade():
    op.drop_column('complaints', 'is_draft')
