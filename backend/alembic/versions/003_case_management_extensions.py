"""case management extensions

Revision ID: 003
Revises: 002
Create Date: 2026-07-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to complaints table
    op.add_column('complaints', sa.Column('complainant_father_name', sa.String(length=255), nullable=True))
    op.add_column('complaints', sa.Column('complainant_address', sa.Text(), nullable=True))
    op.add_column('complaints', sa.Column('incident_datetime', sa.DateTime(timezone=True), nullable=True))
    op.add_column('complaints', sa.Column('incident_location', sa.Text(), nullable=True))
    op.add_column('complaints', sa.Column('address', sa.Text(), nullable=True))

    # Add new columns to cases table
    op.add_column('cases', sa.Column('district', sa.String(length=100), nullable=True))
    op.add_column('cases', sa.Column('police_station', sa.String(length=150), nullable=True))
    op.add_column('cases', sa.Column('fir_no', sa.String(length=50), nullable=True))
    op.add_column('cases', sa.Column('fir_year', sa.Integer(), nullable=True))
    op.add_column('cases', sa.Column('fir_date', sa.Date(), nullable=True))
    op.add_column('cases', sa.Column('incident_datetime', sa.DateTime(timezone=True), nullable=True))
    op.add_column('cases', sa.Column('original_chargesheet_no', sa.String(length=50), nullable=True))
    op.add_column('cases', sa.Column('original_chargesheet_date', sa.Date(), nullable=True))
    op.add_column('cases', sa.Column('supplementary_chargesheet_no', sa.String(length=50), nullable=True))
    op.add_column('cases', sa.Column('supplementary_reason', sa.Text(), nullable=True))
    op.add_column('cases', sa.Column('court_name', sa.String(length=200), nullable=True))
    op.add_column('cases', sa.Column('court_no', sa.String(length=50), nullable=True))
    op.add_column('cases', sa.Column('current_stage', sa.String(length=100), nullable=True))

    # Add new columns to case_diaries table
    op.add_column('case_diaries', sa.Column('remarks', sa.Text(), nullable=True))
    op.add_column('case_diaries', sa.Column('next_action', sa.Text(), nullable=True))

    # Add new columns to evidences table
    op.add_column('evidences', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('evidences', sa.Column('serial_number', sa.String(length=200), nullable=True))
    op.add_column('evidences', sa.Column('quantity', sa.Integer(), server_default='1', nullable=True))
    op.add_column('evidences', sa.Column('item_condition', sa.Text(), nullable=True))
    op.add_column('evidences', sa.Column('seized_from', sa.String(length=255), nullable=True))
    op.add_column('evidences', sa.Column('seizure_datetime', sa.DateTime(timezone=True), nullable=True))
    op.add_column('evidences', sa.Column('seizure_location', sa.Text(), nullable=True))
    op.add_column('evidences', sa.Column('seal_number', sa.String(length=100), nullable=True))
    op.add_column('evidences', sa.Column('storage_location', sa.Text(), nullable=True))

    # Add new columns to officers table
    op.add_column('officers', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('officers', sa.Column('email', sa.String(length=100), nullable=True))
    op.add_column('officers', sa.Column('signature_path', sa.Text(), nullable=True))


def downgrade():
    # Rollback officers table
    op.drop_column('officers', 'signature_path')
    op.drop_column('officers', 'email')
    op.drop_column('officers', 'phone')

    # Rollback evidences table
    op.drop_column('evidences', 'storage_location')
    op.drop_column('evidences', 'seal_number')
    op.drop_column('evidences', 'seizure_location')
    op.drop_column('evidences', 'seizure_datetime')
    op.drop_column('evidences', 'seized_from')
    op.drop_column('evidences', 'item_condition')
    op.drop_column('evidences', 'quantity')
    op.drop_column('evidences', 'serial_number')
    op.drop_column('evidences', 'description')

    # Rollback case_diaries table
    op.drop_column('case_diaries', 'next_action')
    op.drop_column('case_diaries', 'remarks')

    # Rollback cases table
    op.drop_column('cases', 'current_stage')
    op.drop_column('cases', 'court_no')
    op.drop_column('cases', 'court_name')
    op.drop_column('cases', 'supplementary_reason')
    op.drop_column('cases', 'supplementary_chargesheet_no')
    op.drop_column('cases', 'original_chargesheet_date')
    op.drop_column('cases', 'original_chargesheet_no')
    op.drop_column('cases', 'incident_datetime')
    op.drop_column('cases', 'fir_date')
    op.drop_column('cases', 'fir_year')
    op.drop_column('cases', 'fir_no')
    op.drop_column('cases', 'police_station')
    op.drop_column('cases', 'district')

    # Rollback complaints table
    op.drop_column('complaints', 'address')
    op.drop_column('complaints', 'incident_location')
    op.drop_column('complaints', 'incident_datetime')
    op.drop_column('complaints', 'complainant_address')
    op.drop_column('complaints', 'complainant_father_name')
