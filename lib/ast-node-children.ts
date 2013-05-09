export interface ChildNamesMap {
    [nodeTypes:string]:string[];
}
declare var module:{
    exports:ChildNamesMap;
};

var nodeChildNames:ChildNamesMap = {
    // Angl source file
    "file": [
        "stmts"
    ],
    // Sequence of statements
    "statements": [
        "list"
    ],
    "nop": [],
    // Var declaration
    "var": [
        "list"
    ],
    "var_item": [
        "expr"
    ],
    "const": [
        "expr"
    ],
    // Identifiers
    "identifier": [],
    // Literals
    "number": [],
    "string": [],
    // Operators
    "binop": [
        "expr1",
        "expr2"
    ],
    "unop": [
        "expr"
    ],
    // Array subscripting
    "index": [
        "expr",
        "indexes"
    ],
    // Function invocation
    "funccall": [
        "expr",
        "args"
    ],
    // Scripts
    "scriptdef": [
        "stmts"
    ],
    "script": [
        "stmts"
    ],
    // Objects
    "object": [
        "stmts"
    ],
    "createdef": [
        "stmts"
    ],
    "destroydef": [
        "stmts"
    ],
    "property": [
        "expr"
    ],
    "super": [
        "args"
    ],
    // Assignment
    "assign": [
        "lval",
        "rval"
    ],
    "cmpassign": [
        "lval",
        "rval"
    ],
    // Control flow statements
    "return": [
        "expr"
    ],
    "continue": [],
    "break": [],
    "exit": [],
    // Control flow statements w/blocks
    "for": [
        "initstmt",
        "contexpr",
        "stepstmt",
        "stmt"
    ],
    "if": [
        "expr",
        "stmt"
    ],
    "ifelse": [
        "expr",
        "stmt1",
        "stmt2"
    ],
    "repeat": [
        "expr",
        "stmt"
    ],
    "while": [
        "expr",
        "stmt"
    ],
    "dountil": [
        "expr",
        "stmt"
    ],
    "switch": [
        "expr",
        "cases"
    ],
    "case": [
        "expr",
        "stmts"
    ],
    "defaultcase": [
        "stmts"
    ],
    "with": [
        "expr",
        "stmt"
    ]
};

(module).exports = nodeChildNames;
