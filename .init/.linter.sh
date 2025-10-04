#!/bin/bash
cd /home/kavia/workspace/code-generation/note-keeper-29152-29197/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

