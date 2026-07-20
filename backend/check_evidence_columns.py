import os
from dotenv import load_dotenv
from sqlalchemy import inspect, create_engine

load_dotenv()

engine = create_engine(os.getenv('DATABASE_URL'))
inspector = inspect(engine)

# Check columns in evidences table
columns = inspector.get_columns('evidences')
print('Columns in evidences table:')
for col in columns:
    print('  -', col['name'], ':', col['type'])
