import React, {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext,
    useReducer,
  } from "react";
import styles from './todo.css';
  
import { configureStore, createSlice } from "@reduxjs/toolkit";
  
  const capitalize = (s) => s.charAt(0).toUpperCase().concat(s.slice(1));
  const filterList = ["all", "completed", "todo"];
  
  const fetchTodos = () =>
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((data) => data.json())
      .then((todos) => todos.slice(0, 3));
  
  const TodoContext = createContext(null);
  
  const initialState = {
    todos: [],
    filter: "all",
    globalId: 3000,
  };
  
  const todosSlice = createSlice({
    name: "todos",
    initialState,
    reducers: {
    },
  });
  
  const store = configureStore({ reducer: todosSlice.reducer });
  
  function reducer(state, action) {
    switch (action.type) {
      case "change.filter":
        return { ...state, filter: action.payload.filter };
      case "init.todos":
        return { ...state, todos: action.payload.todos };
      case "add.todo": {
        return {
          ...state,
          todos: [{ title: action.payload.title, id: state.globalId + 1 }],
          globalId: state.globalId + 1,
        };
      }
      case "delete.todo": {
        return {
          ...state,
          todos: state.todos.filter((todo) => todo.id !== action.payload.id),
        };
      }
      case "toggle.todo": {
        return {
          ...state,
          todos: state.todos.map((t) =>
            t.id === action.payload.id ? { ...t, completed: !t.completed } : t
          ),};
      }
      default:
        return state;
    }
  }
  
  function useTodoContext() {
    const context = useContext(TodoContext);
    if (!context) {
      throw new Error("Use TodoContext inside Provider.");
    }
    return context;
  }
  
  
  function useTodoState() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const toggleTodo = useCallback(
      (id) => dispatch({ type: "toggle.todo", payload: { id } }),
      []
    );
    const deleteTodo = useCallback(
      (id) => dispatch({ type: "delete.todo", payload: { id } }),
      []
    );
    const addTodo = useCallback(
      (title) => dispatch({ type: "add.todo", payload: { title } }),
      []
    );
    const changeFilter = useCallback(
      (filter) => dispatch({ type: "change.filter", payload: { filter } }),
      []
    );
    const initializeTodos = useCallback(
      (todos) => dispatch({ type: "init.todos", payload: { todos } }),
      []
    );
  
    return {
      state,
      toggleTodo,
      deleteTodo,
      addTodo,
      changeFilter,
      initializeTodos,
    };
  }
  
  function TodoContextProvider({ children }) {
    const values = useTodoState();
    return <TodoContext.Provider value={values}>{children}</TodoContext.Provider>;
  }
  
  function TodoApp() {
    return (
      <TodoContextProvider>
        <TodosPage />
      </TodoContextProvider>
    );
  }
  
  export default TodoApp;
  
  function TodosPage() {

    const { initializeTodos } = useTodoContext();
  
    useEffect(() => {
      fetchTodos().then(initializeTodos);
    }, [initializeTodos]);
  
    return (
      <div>
        <TodoForm />
        <TodoFilter />
        <TodoList />
      </div>
    );
  }
  
  function TodoForm() {

    const { addTodo } = useTodoContext();
    const [title, setTitle] = useState("");
  
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(title);
          setTitle("");
        }}
      >
        <label htmlFor="todo-title">Title</label>
  
        <input
          id="todo-title"
          type="text"
          name="todo-title"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
  
        <button type="submit">Make</button>
      </form>
    );
  }
  
  function TodoList() {
    const { state, toggleTodo, deleteTodo } = useTodoContext();
  
    const { todos, filter } = state;
  

    const filteredTodos = todos.filter((todo) => {
      return (
        filter === "all" ||
        (filter === "completed" && todo.completed) ||
        (filter === "todo" && !todo.completed)
      );
    });
  
    const handleDeleteTodo = (id) => (e) => {
      e.stopPropagation();
      deleteTodo(id);
    };
  
    return (
      <ul>
        {filteredTodos.map(({ title, completed, id }) => (
          <li key={id} onClick={() => toggleTodo(id)}>
            <h5>{title}</h5>
            <div>
              {completed ? "☑️ " : "✏️ "}
              <button onClick={handleDeleteTodo(id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    );
  }
  
  function TodoFilter() {
    const { state, changeFilter } = useTodoContext();
    const { filter } = state;
  
    return (
      <div>
        <label htmlFor="filter">Filter</label>
        <select
          onChange={(e) => changeFilter(e.target.value)}
          id="filter"
          name="filter"
          value={filter}
        >
          {filterList.map((filterText) => (
            <option key={filterText} value={filterText}>
              {capitalize(filterText)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  