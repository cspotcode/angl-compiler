module.exports = {
    "type": "statements",
    "list": [
        {
            "type": "var",
            "list": [
                "a"
            ]
        },
        {
            "type": "set",
            "lval": {
                "type": "identifier",
                "val": "a"
            },
            "rval": {
                "type": "binop",
                "exp1": {
                    "type": "number",
                    "val": 2
                },
                "exp2": {
                    "type": "unop",
                    "exp1": {
                        "type": "number",
                        "val": 2
                    },
                    "op": "-"
                },
                "op": "+"
            }
        },
        {
            "type": "set",
            "lval": {
                "type": "identifier",
                "val": "x"
            },
            "rval": {
                "type": "binop",
                "exp1": {
                    "type": "number",
                    "val": 7
                },
                "exp2": {
                    "type": "number",
                    "val": 3
                },
                "op": "^"
            }
        }
    ]
}