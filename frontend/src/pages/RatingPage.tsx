import { useRatings } from "../context/RatingsContext";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const RatingPage = () => {
  const { ratings, removeRating } = useRatings();

  if (ratings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Ratings</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't rated any games yet.</p>
          <p className="text-gray-500">
            Go to the home page to start rating games!
          </p>
        </div>
      </div>
    );
  }

  // Sort ratings by date rated (newest first)
  const sortedRatings = [...ratings].sort(
    (a, b) => new Date(b.dateRated).getTime() - new Date(a.dateRated).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Ratings</h1>

      <div className="max-w-[660px] mx-auto">
        {sortedRatings.map((game) => {
          // Format the game date
          const gameDate = new Date(game.gameDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          // Check if it's an All-Star Game
          const isAllStarGame =
            game.homeTeam.includes("Team") ||
            game.awayTeam.includes("Team") ||
            game.homeTeam.includes("All-Star") ||
            game.awayTeam.includes("All-Star");

          return (
            <div
              key={`rating-${game.gameId}`}
              className="flex flex-row my-4 p-3 border border-gray-200 rounded-md justify-between items-center"
            >
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">{gameDate}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((starNumber) => {
                      // Determine if this star should be full, half, or empty
                      const isFull = starNumber <= Math.floor(game.rating);
                      const isHalf =
                        !isFull &&
                        starNumber === Math.ceil(game.rating) &&
                        game.rating % 1 !== 0;

                      return (
                        <div
                          key={`rating-star-${starNumber}`}
                          className="relative"
                          style={{ width: 16, height: 16 }}
                        >
                          {/* Base empty star */}
                          <FaStar size={16} color="#e4e5e9" />

                          {/* Full star overlay */}
                          {isFull && (
                            <FaStar
                              size={16}
                              color="#ffc107"
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                              }}
                            />
                          )}

                          {/* Half star overlay */}
                          {isHalf && (
                            <FaStarHalfAlt
                              size={16}
                              color="#ffc107"
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                    <span className="ml-2 font-semibold">
                      {game.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 mr-2 flex justify-center items-center">
                      {game.homeLogoUrl ? (
                        <img
                          src={game.homeLogoUrl}
                          alt={`${game.homeTeam} logo`}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 flex items-center justify-center rounded-full">
                          {game.homeTeam.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <span>{game.homeTeam}</span>
                    <span className="mx-2 font-semibold">{game.homeScore}</span>
                  </div>

                  <button
                    className="text-sm text-red-500 hover:text-red-700"
                    onClick={() => removeRating(game.gameId)}
                  >
                    Delete
                  </button>
                </div>

                <div className="flex items-center mt-2">
                  <div className="h-10 w-10 mr-2 flex justify-center items-center">
                    {game.awayLogoUrl ? (
                      <img
                        src={game.awayLogoUrl}
                        alt={`${game.awayTeam} logo`}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 flex items-center justify-center rounded-full">
                        {game.awayTeam.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <span>{game.awayTeam}</span>
                  <span className="mx-2 font-semibold">{game.awayScore}</span>
                </div>

                {isAllStarGame && (
                  <div className="mt-2">
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                      All-Star Game
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingPage;
