import './App.css';
import React from 'react';
import TimerApp from './components/todolist/todo';
import styled from "styled-components"; 
import styles from './App.css';


const Container = styled.div` 
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;


function App() {
  return (
    <div>
     <Container> 
       <TimerApp className={styles.timerapp} />
     </Container>
    </div>
  );
}

export default App;
