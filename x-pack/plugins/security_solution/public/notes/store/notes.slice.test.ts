/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  createNote,
  fetchNotesByDocumentId,
  initialNotesState,
  notesReducer,
  ReqStatus,
  selectAllNotes,
  selectCreateNoteError,
  selectCreateNoteStatus,
  selectFetchNotesByDocumentIdError,
  selectFetchNotesByDocumentIdStatus,
  selectNoteById,
  selectNoteIds,
  selectNotesByDocumentId,
} from './notes.slice';
import { generateNoteMock } from '../api/api';
import { mockGlobalState } from '../../common/mock';

const initalEmptyState = initialNotesState;

const mockNote = { ...generateNoteMock('1') };
const initialNonEmptyState = {
  entities: {
    [mockNote.noteId]: mockNote,
  },
  ids: [mockNote.noteId],
  status: { fetchNotesByDocumentId: ReqStatus.Idle, createNote: ReqStatus.Idle },
  error: { fetchNotesByDocumentId: null, createNote: null },
};

describe('notesSlice', () => {
  describe('notesReducer', () => {
    it('should handle an unknown action and return the initial state', () => {
      expect(notesReducer(initalEmptyState, { type: 'unknown' })).toEqual({
        entities: {},
        ids: [],
        status: { fetchNotesByDocumentId: ReqStatus.Idle, createNote: ReqStatus.Idle },
        error: { fetchNotesByDocumentId: null, createNote: null },
      });
    });

    describe('fetchNotesByDocumentId', () => {
      it('should set correct state when fetching notes by document id', () => {
        const action = { type: fetchNotesByDocumentId.pending.type };

        expect(notesReducer(initalEmptyState, action)).toEqual({
          entities: {},
          ids: [],
          status: {
            fetchNotesByDocumentId: ReqStatus.Loading,
            createNote: ReqStatus.Idle,
          },
          error: { fetchNotesByDocumentId: null, createNote: null },
        });
      });

      it('should set correct state when success on fetch notes by document id on an empty state', () => {
        const action = {
          type: fetchNotesByDocumentId.fulfilled.type,
          payload: {
            entities: {
              notes: {
                [mockNote.noteId]: mockNote,
              },
            },
            result: [mockNote.noteId],
          },
        };

        expect(notesReducer(initalEmptyState, action)).toEqual({
          entities: action.payload.entities.notes,
          ids: action.payload.result,
          status: {
            fetchNotesByDocumentId: ReqStatus.Succeeded,
            createNote: ReqStatus.Idle,
          },
          error: { fetchNotesByDocumentId: null, createNote: null },
        });
      });

      it('should replace notes when success on fetch notes by document id on a non-empty state', () => {
        const newMockNote = { ...mockNote, timelineId: 'timelineId' };
        const action = {
          type: fetchNotesByDocumentId.fulfilled.type,
          payload: {
            entities: {
              notes: {
                [newMockNote.noteId]: newMockNote,
              },
            },
            result: [newMockNote.noteId],
          },
        };

        expect(notesReducer(initialNonEmptyState, action)).toEqual({
          entities: action.payload.entities.notes,
          ids: action.payload.result,
          status: {
            fetchNotesByDocumentId: ReqStatus.Succeeded,
            createNote: ReqStatus.Idle,
          },
          error: { fetchNotesByDocumentId: null, createNote: null },
        });
      });

      it('should set correct state when error on fetch notes by document id', () => {
        const action = { type: fetchNotesByDocumentId.rejected.type, error: 'error' };

        expect(notesReducer(initalEmptyState, action)).toEqual({
          entities: {},
          ids: [],
          status: {
            fetchNotesByDocumentId: ReqStatus.Failed,
            createNote: ReqStatus.Idle,
          },
          error: { fetchNotesByDocumentId: 'error', createNote: null },
        });
      });
    });

    describe('createNote', () => {
      it('should set correct state when creating a note by document id', () => {
        const action = { type: createNote.pending.type };

        expect(notesReducer(initalEmptyState, action)).toEqual({
          entities: {},
          ids: [],
          status: {
            fetchNotesByDocumentId: ReqStatus.Idle,
            createNote: ReqStatus.Loading,
          },
          error: { fetchNotesByDocumentId: null, createNote: null },
        });
      });

      it('should set correct state when success on create a note by document id on an empty state', () => {
        const action = {
          type: createNote.fulfilled.type,
          payload: {
            entities: {
              notes: {
                [mockNote.noteId]: mockNote,
              },
            },
            result: mockNote.noteId,
          },
        };

        expect(notesReducer(initalEmptyState, action)).toEqual({
          entities: action.payload.entities.notes,
          ids: [action.payload.result],
          status: {
            fetchNotesByDocumentId: ReqStatus.Idle,
            createNote: ReqStatus.Succeeded,
          },
          error: { fetchNotesByDocumentId: null, createNote: null },
        });
      });

      it('should set correct state when error on create a note by document id', () => {
        const action = { type: createNote.rejected.type, error: 'error' };

        expect(notesReducer(initalEmptyState, action)).toEqual({
          entities: {},
          ids: [],
          status: {
            fetchNotesByDocumentId: ReqStatus.Idle,
            createNote: ReqStatus.Failed,
          },
          error: { fetchNotesByDocumentId: null, createNote: 'error' },
        });
      });
    });
  });

  describe('selectors', () => {
    it('should return all notes', () => {
      const state = mockGlobalState;
      state.notes.entities = initialNonEmptyState.entities;
      state.notes.ids = initialNonEmptyState.ids;
      expect(selectAllNotes(state)).toEqual([mockNote]);
    });

    it('should return note by id', () => {
      const state = mockGlobalState;
      state.notes.entities = initialNonEmptyState.entities;
      state.notes.ids = initialNonEmptyState.ids;
      expect(selectNoteById(state, mockNote.noteId)).toEqual(mockNote);
    });

    it('should return note ids', () => {
      const state = mockGlobalState;
      state.notes.entities = initialNonEmptyState.entities;
      state.notes.ids = initialNonEmptyState.ids;
      expect(selectNoteIds(state)).toEqual([mockNote.noteId]);
    });

    it('should return fetch notes by document id status', () => {
      expect(selectFetchNotesByDocumentIdStatus(mockGlobalState)).toEqual(ReqStatus.Idle);
    });

    it('should return fetch notes by document id error', () => {
      expect(selectFetchNotesByDocumentIdError(mockGlobalState)).toEqual(null);
    });

    it('should return create note by document id status', () => {
      expect(selectCreateNoteStatus(mockGlobalState)).toEqual(ReqStatus.Idle);
    });

    it('should return create note by document id error', () => {
      expect(selectCreateNoteError(mockGlobalState)).toEqual(null);
    });

    it('should return all notes for an existing document id', () => {
      expect(selectNotesByDocumentId(mockGlobalState, '1')).toEqual([mockNote]);
    });

    it('should return no notes if document id does not exist', () => {
      expect(selectNotesByDocumentId(mockGlobalState, '2')).toHaveLength(0);
    });
  });
});
