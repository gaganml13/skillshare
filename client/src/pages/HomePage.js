// HomePage.js - Displays the Hero section on the homepage
import React from 'react';
import Hero from '../components/home/Hero';
import CourseList from '../components/home/CourseList';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <CourseList />
    </div>
  );
};

export default HomePage;

/*
Code Description:
- Imports and displays the Hero component as the visually stunning top section.
- Displays the CourseList section directly below the Hero, showing featured courses in a responsive grid.
- Both components are styled for modern UI and easy readability.
*/
