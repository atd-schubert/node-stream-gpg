# node-stream-gpg
Streaming to and from GPG on node.js

*This modules is under development and in alpha status. The goal is to provide an easy to use nodejs typical API*

## Roadmap

- 0.0.1: Implement the basic gpg API in node without card support and maybe without sending keys
    1. list functions
    2. import and export
    3. search and receive
    4. generators
    5. decypt and encrypt
    6. edit keys
- 0.0.2: Create a node API with Key classes etc. that handles the gpg API in an easy way
- 0.1.0: Implement send keys and if there is somebody giving me the card reader implement this, too ;).