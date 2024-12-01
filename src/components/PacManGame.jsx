import React, { useEffect, useState, useRef } from "react";
import "./PacManGame.css";

const PacManGame = () => {
  const canvasRef = useRef(null);
  const [pacmanPos, setPacmanPos] = useState({ x: 4, y: 4 });
  const [pacmanDirection, setPacmanDirection] = useState("RIGHT");
  const [gameState, setGameState] = useState("playing");
  const [dots, setDots] = useState([]);
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState([
    { x: 2, y: 2, direction: "RIGHT" },
    { x: 15, y: 15, direction: "LEFT" }
  ]);

  const gridSize = 20; // Increased grid size to 20
  const speed = 150; // Time between moves (in milliseconds)

  // Generate dots on the grid with higher probability
  const generateDots = () => {
    let newDots = [];
    for (let i = 1; i < gridSize - 1; i++) {
      for (let j = 1; j < gridSize - 1; j++) {
        if (Math.random() < 0.4) {  // Increased chance to place a dot (40%)
          newDots.push({ x: i, y: j });
        }
      }
    }
    setDots(newDots);
  };

  // Generate random direction for enemies (up, down, left, right)
  const getRandomDirection = () => {
    const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  // Move enemies in random directions
  const moveEnemies = () => {
    const newEnemies = enemies.map(enemy => {
      let newEnemyPos = { ...enemy };

      switch (enemy.direction) {
        case "UP":
          newEnemyPos.y -= 1;
          break;
        case "DOWN":
          newEnemyPos.y += 1;
          break;
        case "LEFT":
          newEnemyPos.x -= 1;
          break;
        case "RIGHT":
          newEnemyPos.x += 1;
          break;
        default:
          break;
      }

      // Check if the enemy is out of bounds and change direction
      if (newEnemyPos.x <= 0 || newEnemyPos.x >= gridSize - 1 || newEnemyPos.y <= 0 || newEnemyPos.y >= gridSize - 1) {
        newEnemyPos.direction = getRandomDirection(); // Change direction if out of bounds
      }

      return newEnemyPos;
    });

    setEnemies(newEnemies);
  };

  // Check if Pac-Man collides with any enemy
  const checkCollisionWithEnemies = () => {
    const collided = enemies.some(enemy => enemy.x === pacmanPos.x && enemy.y === pacmanPos.y);
    if (collided) {
      setGameState("gameOver");
    }
  };

  // Draw grid, game elements, and enemies
  const drawGame = (context) => {
    const cellSize = canvasRef.current.width / gridSize;

    // Clear previous frame
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw walls (perimeter)
    context.fillStyle = "#0000ff";
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (i === 0 || j === 0 || i === gridSize - 1 || j === gridSize - 1) {
          context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw dots (Pellets)
    context.fillStyle = "white";
    dots.forEach(dot => {
      context.beginPath();
      context.arc(dot.x * cellSize + cellSize / 2, dot.y * cellSize + cellSize / 2, cellSize / 6, 0, 2 * Math.PI);
      context.fill();
    });

    // Draw Pac-Man (Yellow circle)
    context.fillStyle = "yellow";
    context.beginPath();
    context.arc(
      pacmanPos.x * cellSize + cellSize / 2,
      pacmanPos.y * cellSize + cellSize / 2,
      cellSize / 3,
      0.2 * Math.PI,
      1.8 * Math.PI
    );
    context.lineTo(
      pacmanPos.x * cellSize + cellSize / 2,
      pacmanPos.y * cellSize + cellSize / 2
    );
    context.fill();

    // Draw enemies (Red circles)
    context.fillStyle = "red";
    enemies.forEach(enemy => {
      context.beginPath();
      context.arc(
        enemy.x * cellSize + cellSize / 2,
        enemy.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        2 * Math.PI
      );
      context.fill();
    });
  };

  // Handle key presses for movement
  const handleKeyDown = (e) => {
    if (gameState === "playing") {
      switch (e.key) {
        case "ArrowUp":
          if (pacmanPos.y > 1) setPacmanDirection("UP");
          break;
        case "ArrowDown":
          if (pacmanPos.y < gridSize - 2) setPacmanDirection("DOWN");
          break;
        case "ArrowLeft":
          if (pacmanPos.x > 1) setPacmanDirection("LEFT");
          break;
        case "ArrowRight":
          if (pacmanPos.x < gridSize - 2) setPacmanDirection("RIGHT");
          break;
        default:
          break;
      }
    }
  };

  // Move Pac-Man based on direction
  const movePacman = () => {
    let newPos = { ...pacmanPos };

    switch (pacmanDirection) {
      case "UP":
        newPos.y -= 1;
        break;
      case "DOWN":
        newPos.y += 1;
        break;
      case "LEFT":
        newPos.x -= 1;
        break;
      case "RIGHT":
        newPos.x += 1;
        break;
      default:
        break;
    }

    // Check if Pac-Man hits a wall (game over condition)
    if (newPos.x <= 0 || newPos.x >= gridSize - 1 || newPos.y <= 0 || newPos.y >= gridSize - 1) {
      setGameState("gameOver");
      return;
    }

    // Check if Pac-Man collects a dot
    const newDots = dots.filter(dot => dot.x !== newPos.x || dot.y !== newPos.y);
    if (dots.length !== newDots.length) {
      setScore(score + 10);  // Increment score when a dot is collected
    }

    setDots(newDots);
    setPacmanPos(newPos);
  };

  // Update game state and animation
  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    drawGame(context);

    const intervalId = setInterval(() => {
      if (gameState === "playing") {
        movePacman();
        moveEnemies();
        checkCollisionWithEnemies();
        drawGame(context);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [pacmanPos, pacmanDirection, gameState, enemies]);

  // Listen for keydown events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pacmanPos, pacmanDirection]);

  // Start the game
  useEffect(() => {
    generateDots();  // Generate dots when the game starts
  }, []);

  // Restart the game
  const restartGame = () => {
    setGameState("playing");
    setPacmanPos({ x: 4, y: 4 });
    setPacmanDirection("RIGHT");
    setScore(0);
    setEnemies([
      { x: 2, y: 2, direction: "RIGHT" },
      { x: 15, y: 15, direction: "LEFT" }
    ]);
    generateDots();
  };

  return (
    <div className="game-container">
      <h1>Pac-Man Game</h1>
      <canvas
        ref={canvasRef}
        width={600} // Increased width for bigger canvas
        height={600} // Increased height for bigger canvas
        style={{ border: "2px solid black" }}
      />
      <div>
        <h2>Score: {score}</h2>
      </div>
      {gameState === "gameOver" && (
        <div className="game-over">
          <h2>Game Over</h2>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default PacManGame;
