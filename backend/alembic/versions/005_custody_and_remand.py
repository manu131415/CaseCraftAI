"""custody and remand

Revision ID: 005
Revises: 004
Create Date: 2026-07-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Create court_custody table
    op.create_table(
        'court_custody',
        sa.Column('custody_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('accused_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('prison_name', sa.String(length=255), nullable=True),
        sa.Column('commitment_from', sa.Date(), nullable=True),
        sa.Column('commitment_to', sa.Date(), nullable=True),
        sa.Column('court_order_number', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('custody_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], name='court_custody_case_id_fkey'),
        sa.ForeignKeyConstraint(['accused_id'], ['accused.accused_id'], name='court_custody_accused_id_fkey')
    )
    op.create_index('court_custody_pkey', 'court_custody', ['custody_id'], unique=True)

    # Create remand_details table
    op.create_table(
        'remand_details',
        sa.Column('remand_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('accused_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('remand_days', sa.Integer(), nullable=True),
        sa.Column('custody_type', sa.String(length=100), nullable=True),
        sa.Column('grounds', sa.Text(), nullable=True),
        sa.Column('expiry_datetime', sa.DateTime(timezone=True), nullable=True),
        sa.Column('order_date', sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint('remand_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], name='remand_details_case_id_fkey'),
        sa.ForeignKeyConstraint(['accused_id'], ['accused.accused_id'], name='remand_details_accused_id_fkey')
    )
    op.create_index('remand_details_pkey', 'remand_details', ['remand_id'], unique=True)


def downgrade():
    op.drop_index('remand_details_pkey', table_name='remand_details')
    op.drop_table('remand_details')
    
    op.drop_index('court_custody_pkey', table_name='court_custody')
    op.drop_table('court_custody')
