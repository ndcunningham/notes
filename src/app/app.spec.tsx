import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './app';

// Mock localStorage for Vitest
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Sticky Notes App - Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render app with default note after loading', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your notes...')).not.toBeInTheDocument();
    });

    // Check main components are rendered
    expect(screen.getByText('➕ New Note')).toBeInTheDocument();
    expect(screen.getByText('Drop here to delete')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('should create new notes with selected color', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Loading your notes...')).not.toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Initially should have 1 note
    expect(screen.getAllByPlaceholderText('Type here...')).toHaveLength(1);

    // Select blue color and create new note
    await user.click(screen.getByLabelText('Select blue color'));
    await user.click(screen.getByText('➕ New Note'));

    // Click on workspace to place the note
    const workspace = screen.getByRole('main', { name: 'Notes workspace' });
    await user.click(workspace);

    // Should have 2 notes, with new one being blue
    expect(screen.getAllByPlaceholderText('Type here...')).toHaveLength(2);
    const notes = screen.getAllByRole('region', { name: /sticky note/ });
    const newNote = notes[notes.length - 1];
    expect(newNote).toHaveClass('bg-noteBlue');
  });

  it('should save and load content from localStorage', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText('Loading your notes...')).not.toBeInTheDocument();
    });

    const user = userEvent.setup();
    const textarea = screen.getByPlaceholderText('Type here...');

    // Type content and verify it saves
    await user.type(textarea, 'Test note content');
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // Verify content is in the textarea
    expect(textarea).toHaveValue('Test note content');
  });

  it('should load saved notes from localStorage on startup', async () => {
    const savedData = {
      notes: [
        {
          id: '1',
          color: 'pink',
          x: 50,
          y: 50,
          width: 200,
          height: 150,
          content: 'My saved note',
          zIndex: 1
        }
      ],
      maxZIndex: 1
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading your notes...')).not.toBeInTheDocument();
    });

    // Should render the saved note with its content
    expect(screen.getByDisplayValue('My saved note')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /sticky note/ })).toHaveClass('bg-notePink');
  });
});
