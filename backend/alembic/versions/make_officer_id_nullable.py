"""Make officer_id nullable in case_diaries

Revision ID: make_officer_id_nullable_001
Revises: add_attachments_001
Create Date: 2026-07-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'make_officer_id_nullable_001'
down_revision = 'add_attachments_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the foreign key constraint
    op.drop_constraint('fk_diary_officer', 'case_diaries', type_='foreignkey')
    # Make officer_id nullable
    op.alter_column('case_diaries', 'officer_id', existing_type=sa.String(), nullable=True)
    # Re-add the foreign key constraint with nullable=True
    op.create_foreign_key('fk_diary_officer', 'case_diaries', 'officers', ['officer_id'], ['officer_id'])


def downgrade() -> None:
    # Drop the foreign key constraint
    op.drop_constraint('fk_diary_officer', 'case_diaries', type_='foreignkey')
    # Make officer_id non-nullable
    op.alter_column('case_diaries', 'officer_id', existing_type=sa.String(), nullable=False)
    # Re-add the foreign key constraint with nullable=False
    op.create_foreign_key('fk_diary_officer', 'case_diaries', 'officers', ['officer_id'], ['officer_id'])
