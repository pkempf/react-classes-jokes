import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: [],
    };
    this.getJokes = this.getJokes.bind(this);
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.vote = this.vote.bind(this);
  }

  async getJokes() {
    let j = [...this.state.jokes];
    let seenJokes = new Set(j);
    try {
      while (j.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0 });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ jokes: j });
    } catch (e) {
      console.log(e);
    }
  }

  generateNewJokes() {
    this.setState({ jokes: [] });
  }

  vote(id, delta) {
    let updatedJokes = this.state.jokes.map((j) =>
      j.id === id ? { ...j, votes: j.votes + delta } : j
    );
    this.setState({ jokes: updatedJokes });
  }

  componentDidMount() {
    this.generateNewJokes();
  }

  componentDidUpdate(prevProps) {
    if (this.state.jokes.length < this.props.numJokesToGet) {
      this.getJokes();
    }

    if (this.props.numJokesToGet !== prevProps.numJokesToGet) {
      this.generateNewJokes();
    }
  }

  render() {
    if (this.state.jokes.length) {
      let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
          </button>

          {sortedJokes.map((j) => (
            <Joke
              text={j.joke}
              key={j.id}
              id={j.id}
              votes={j.votes}
              vote={this.vote}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="JokeList">
        <div className="JokeList-loading fa-3x">
          <i className="fas fa-spinner fa-spin"></i>
          <span> Loading jokes... </span>
        </div>
      </div>
    );
  }
}

JokeList.defaultProps = {
  numJokesToGet: 10,
};

export default JokeList;
