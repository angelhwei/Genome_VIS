from flask import Flask, jsonify
from geneToJson import generate_data  # Make sure geneToJson.py is in the same directory

app = Flask(__name__)

@app.route('/data')
def serve_data():
    data = generate_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)