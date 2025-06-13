# cs348-project

1. ssh into and set up the student env and ``connect to CS348;``
2. git clone this repo
3. run createtables.sql
4. run populatetables.sql


To run QueryDB.py

```bash
python -m venv myenv
source myenv/bin/activate
pip install ibm_db
python QueryDB.py
```

frontend:
```
cd app
npm i
npm run dev
```

to have ssh forward the port, do
`ssh -L 5173:local_host:5173 username@server.whatever`
