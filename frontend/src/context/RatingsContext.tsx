import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of a rated game
export interface RatedGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  homeLogoUrl?: string; // Added for storing logo URLs
  awayLogoUrl?: string; // Added for storing logo URLs
  rating: number;
  dateRated: Date;
  gameDate: Date;
}

// Define the context type
interface RatingsContextType {
  ratings: RatedGame[];
  addRating: (game: RatedGame) => void;
  removeRating: (gameId: string) => void;
}

// Create the context
const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

// Provider component
export const RatingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ratings, setRatings] = useState<RatedGame[]>([]);

  const addRating = (game: RatedGame) => {
    setRatings((prevRatings) => {
      // Check if the game is already rated
      const existingIndex = prevRatings.findIndex(
        (r) => r.gameId === game.gameId
      );

      if (existingIndex >= 0) {
        // Update existing rating
        const updatedRatings = [...prevRatings];
        updatedRatings[existingIndex] = {
          ...game,
          dateRated: new Date(), // Update the date rated
        };
        return updatedRatings;
      } else {
        // Add new rating
        return [...prevRatings, { ...game, dateRated: new Date() }];
      }
    });
  };

  const removeRating = (gameId: string) => {
    setRatings((prevRatings) => prevRatings.filter((r) => r.gameId !== gameId));
  };

  return (
    <RatingsContext.Provider value={{ ratings, addRating, removeRating }}>
      {children}
    </RatingsContext.Provider>
  );
};

// Custom hook to use the ratings context
export const useRatings = () => {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error("useRatings must be used within a RatingsProvider");
  }
  return context;
};
