"""Add attachments column to case_diaries

Revision ID: add_attachments_001
Revises: 007
Create Date: 2026-07-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_attachments_001'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add attachments column to case_diaries table
    op.add_column('case_diaries', sa.Column('attachments', sa.JSON(), nullable=True, server_default='[]'))


def downgrade() -> None:
    # Remove attachments column from case_diaries table
    op.drop_column('case_diaries', 'attachments')
