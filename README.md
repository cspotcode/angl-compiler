Angl-to-Javascript compiler
===

Compiles [Angl](https://github.com/TazeTSchnitzel/angl/) code into Javascript.

**See a live demo here:** http://cspotcode.github.com/angl-compiler/demo

This project relies on TazeTSchnitzel's Angl parser to generate an AST, then compiles that AST into Javascript.

TODO List:
---
* Command-line interface
* Omit parentheses when they aren't necessary
* Add an exception-handling strategy that matches the way angl should behave at runtime (not sure exactly what it should do)
