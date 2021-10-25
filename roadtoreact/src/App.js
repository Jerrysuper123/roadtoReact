// import logo from './logo.svg';
import "./App.scss";
import React from "react";
import axios from "axios";
//playing with module css
import styles from "./buttonCss.module.css";
import styled from "styled-components";

//must use capital S
const StyledButton = styled.button`
  background: green;
  color: white;
  // there is not auto completion
  border: 1px solid black;
  &:hover {
    background: white;
    color: black;
  }
`;

function App() {
  const initialStories = [
    {
      title: "react",
      url: "https://reactjs.org/",
      author: "jerry",
      num_comments: 3,
      points: 4,
      ObjectID: 0,
    },
    {
      title: "redux",
      url: "https://redux.js.org/",
      author: "jerry",
      num_comments: 2,
      points: 5,
      ObjectID: 1,
    },
  ];

  //callback handling, pass info from child to parent
  //handle state in parent, and pass filter stories down to list

  //get the most recent search up when opening up browser

  //create custom react hooks that handle both useState and useEffect
  //key variable - key and initial value

  //make stories stateful, add button dismiss to item, when user click, reset the initial stories
  //it only means data in the background is less
  // const[stories, setStories] = React.useState([]);
  //set isloading and error to show to user
  // const [isLoading, setIsLoading] = React.useState(false);
  // const [isError, setIsError] = React.useState(false);

  const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

  const storiesReducer = (state, action) => {
    switch (action.type) {
      case "STORIES_FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          // is below isError redundant
          isError: false,
        };

      case "STORIES_FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };

      case "STORIES_FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };

      case "REMOVE_STORIES":
        //initial state to merge with state.data to filter out stories when each story's objectID is not
        //the same as the signature
        return {
          ...state,
          data: state.data.filter(
            (story) => story.objectID !== action.payload.objectID
          ),
        };

      default:
        throw new Error();
    }
  };

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isError: false,
    isLoading: false,
  });

  //remove initial story and use promose to delay 2 seconds
  const getAsyncStories = () =>
    // new Promise((resolve, reject)=>setTimeout(reject, 2000));
    new Promise((resolve) =>
      setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)
    );

  const useSemiPersistentState = (key, initialValue) => {
    const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialValue
    );

    React.useEffect(() => {
      localStorage.setItem(key, value);
    }, [value]);

    return [value, setValue];
  };

  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "react");
  //use useState to contain the APi end poin and search term, initialize with initial value
  //when user click submit button, setUrl
  //when url changes, handleFetchStories function is triggered.

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  const handleFetchStories = React.useCallback(async () => {
    if (!searchTerm) return;
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    //promise is so confusing. use try and catch in async and await

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      // setIsError(true)
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handRemovedStories = (item) => {
    // const newStories = stories.filter(story=>item.ObjectID!==story.ObjectID);
    // setStories(newStories);
    dispatchStories({
      type: "REMOVE_STORIES",
      payload: item,
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
    event.preventDefault();
  };

  //filtered story
  //dont forget return keyword for your function
  const searchedStories = stories.data.filter((story) => {
    if (!story.title) {
      return;
    } else {
      return story.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  return (
    <div className="container">
      <h1 className="headline-primary">my hacker stories</h1>
      {/* pass children over */}

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
        submitButton="button_large"
      />
      {stories.isError ? <p>soemething went wrong</p> : null}

      {stories.isLoading ? (
        <p>is loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handRemovedStories} />
      )}

      <div className="contact">contact me here</div>
    </div>
  );
}

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
  submitButton,
}) => {
  return (
    <form onSubmit={onSearchSubmit} className="search-form">
      <InputWithLabel
        id="search"
        label="Search"
        value={searchTerm}
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        className={`button ${submitButton}`}
        // className='button button_large'
        type="submit"
        disabled={!searchTerm}
        // onClick={handleSearchSubmit}
      >
        Submit
      </button>

      {/* <button className={`${styles.button}${styles.buttonLarge}`}>
       */}
      {/* did not receive an error when styling is not defined */}
      <button className={styles.button}>
        use this button to try css modules
      </button>
      <StyledButton>button using styled components</StyledButton>
    </form>
  );
};

const InputWithLabel = ({
  id,
  label,
  value,
  onInputChange,
  type = "text",
  children,
}) => {
  return (
    <div>
      <label htmlFor={id} className="label">
        {children}
      </label>
      <input
        className="input"
        id={id}
        type={type}
        onChange={onInputChange}
        value={value}
      />
    </div>
  );
};

const List = ({ list, onRemoveItem }) => {
  return (
    <ul>
      {list.map((item) => {
        return (
          <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        );
      })}
    </ul>
  );
};

const Item = ({ item, onRemoveItem }) => {
  return (
    <li className="item">
      <span style={{ width: "40%" }}>
        <a href={item.url}> {item.title}</a>
      </span>
      <span style={{ width: "30%" }}>{item.author}</span>
      <span style={{ width: "10%" }}>{item.num_comments}</span>
      <span style={{ width: "10%" }}>{item.points}</span>
      <span style={{ width: "10%" }}>
        <button
          type="button"
          onClick={() => onRemoveItem(item)}
          className="button button_small"
        >
          Dismiss
        </button>
      </span>
    </li>
  );
};

export default App;
