"""Update evidence table columns

Revision ID: 008
Revises: 007
Create Date: 2026-07-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = 'add_attachments_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add only the missing columns
    # The table already has: complaint_id, evidence_type, file_path, description, serial_number, quantity, item_condition, seized_from, seizure_datetime, seizure_location, seal_number, storage_location
    
    op.add_column('evidences', sa.Column('file_name', sa.String(255), nullable=True))
    op.add_column('evidences', sa.Column('file_type', sa.String(100), nullable=True))
    op.add_column('evidences', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))


def downgrade() -> None:
    # Remove columns in reverse order
    op.drop_column('evidences', 'created_at')
    op.drop_column('evidences', 'file_type')
    op.drop_column('evidences', 'file_name')
