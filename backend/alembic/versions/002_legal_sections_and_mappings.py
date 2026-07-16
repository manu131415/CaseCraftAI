"""legal sections and mappings

Revision ID: 002
Revises: 001
Create Date: 2026-07-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Create legal_sections table
    op.create_table(
        'legal_sections',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('act_code', sa.Text(), nullable=False),
        sa.Column('section_number', sa.Text(), nullable=False),
        sa.Column('title', sa.Text(), nullable=True),
        sa.Column('section_text', sa.Text(), nullable=False),
        sa.Column('category', sa.Text(), nullable=True),
        sa.Column('embedding', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('act_code', 'section_number', name='legal_sections_act_code_section_number_key')
    )
    op.create_index('legal_sections_category_idx', 'legal_sections', ['category'])
    op.create_index('legal_sections_embedding_idx', 'legal_sections', ['embedding'])

    # Create legal_section_mappings table
    op.create_table(
        'legal_section_mappings',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('act_pair', sa.String(length=20), nullable=False),
        sa.Column('new_act', sa.String(length=10), nullable=False),
        sa.Column('old_act', sa.String(length=10), nullable=False),
        sa.Column('new_section', sa.Text(), nullable=False),
        sa.Column('old_section', sa.Text(), nullable=True),
        sa.Column('subject', sa.Text(), nullable=True),
        sa.Column('summary_of_comparison', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("act_pair IN ('BNS_IPC', 'BNSS_CRPC', 'BSA_IEA')", name='legal_section_mappings_act_pair_check'),
        sa.CheckConstraint("new_act IN ('BNS', 'BNSS', 'BSA')", name='legal_section_mappings_new_act_check'),
        sa.CheckConstraint("old_act IN ('IPC', 'CrPC', 'IEA')", name='legal_section_mappings_old_act_check')
    )
    op.create_index('idx_lsm_act_pair', 'legal_section_mappings', ['act_pair'])
    op.create_index('idx_lsm_fts', 'legal_section_mappings', [], postgresql_using='gin')
    op.create_index('idx_lsm_new_section', 'legal_section_mappings', ['new_section'])
    op.create_index('idx_lsm_old_section', 'legal_section_mappings', ['old_section'])


def downgrade():
    op.drop_index('idx_lsm_old_section', table_name='legal_section_mappings')
    op.drop_index('idx_lsm_new_section', table_name='legal_section_mappings')
    op.drop_index('idx_lsm_fts', table_name='legal_section_mappings')
    op.drop_index('idx_lsm_act_pair', table_name='legal_section_mappings')
    op.drop_table('legal_section_mappings')
    
    op.drop_index('legal_sections_embedding_idx', table_name='legal_sections')
    op.drop_index('legal_sections_category_idx', table_name='legal_sections')
    op.drop_constraint('legal_sections_act_code_section_number_key', 'legal_sections', type_='unique')
    op.drop_table('legal_sections')
