import { useQuery } from "@tanstack/react-query";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useRatings, RatedGame } from "../context/RatingsContext";

// Format date as YYYYMMDD for API
const formatDateForAPI = (date: Date): string => {
  // Create a new date to avoid modifying the original
  const apiDate = new Date(date);

  // Subtract one day to align with ESPN's schedule display
  apiDate.setDate(apiDate.getDate());

  // Format as YYYYMMDD for the ESPN API
  return apiDate.toISOString().split("T")[0].replace(/-/g, "");
};

// Format date for display
const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Define event type for ESPN API responses
type ESPNEvent = {
  id: string;
  name?: string;
  competitions: Array<{
    competitors?: Array<{
      team?: {
        name?: string;
        abbreviation?: string;
        logo?: string;
      };
      score?: string;
      records?: Array<{ summary?: string }>;
    }>;
    status?: {
      type?: {
        state?: string;
        description?: string;
        shortDetail?: string;
      };
      displayClock?: string;
      period?: number;
    };
  }>;
};

// Check if a game is an All-Star Game
const isAllStarGame = (event: ESPNEvent): boolean => {
  // Check if the name contains "All-Star" or if it has special formatting
  return !!(
    event.name?.includes("All-Star") ||
    event.competitions[0]?.competitors?.some(
      (comp) =>
        comp.team?.name?.includes("All-Star") ||
        comp.team?.name?.includes("Team")
    )
  );
};

const Search = () => {
  const [ratings, setRatings] = useState<Record<string, number>>({}); // Local state for ratings
  const [hoveredStars, setHoveredStars] = useState<{
    gameId: string;
    rating: number;
  } | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Current date state
  const [calendarOpen, setCalendarOpen] = useState(false); // Calendar popover state
  const size = 20; // Reduced size for multiple stars
  const { addRating, ratings: savedRatings } = useRatings(); // Get all saved ratings from context

  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  // Set to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Query games data first
  const { data, isLoading, error } = useQuery({
    queryKey: ["games", formatDateForAPI(currentDate)],
    queryFn: () => getGames(currentDate),
  });

  // Set initial ratings from context after data is loaded
  useEffect(() => {
    if (savedRatings.length > 0 && data?.events?.length > 0) {
      const initialRatings: Record<string, number> = {};

      // For each game in our data
      data.events.forEach((event: ESPNEvent) => {
        const gameId = event.id;

        // Find if we have a saved rating for this game
        const savedRating = savedRatings.find((r) => r.gameId === gameId);

        // If we found a saved rating, add it to our local state
        if (savedRating) {
          initialRatings[gameId] = savedRating.rating;
        }
      });

      // Update local state with saved ratings
      setRatings((prev) => ({
        ...prev,
        ...initialRatings,
      }));
    }
  }, [savedRatings, data]);

  const handleRating = (gameId: string, rating: number, event: ESPNEvent) => {
    // Update local state for UI
    setRatings((prev) => ({
      ...prev,
      [gameId]: rating,
    }));

    // Store in context if there's a valid rating
    if (rating > 0) {
      const homeTeam =
        event.competitions[0]?.competitors?.[0]?.team?.abbreviation || "N/A";
      const awayTeam =
        event.competitions[0]?.competitors?.[1]?.team?.abbreviation || "N/A";
      const homeScore = event.competitions[0]?.competitors?.[0]?.score || "0";
      const awayScore = event.competitions[0]?.competitors?.[1]?.score || "0";

      // Get logo URLs from the API
      const homeLogoUrl =
        event.competitions[0]?.competitors?.[0]?.team?.logo || "";
      const awayLogoUrl =
        event.competitions[0]?.competitors?.[1]?.team?.logo || "";

      // Create a new RatedGame object
      const ratedGame: RatedGame = {
        gameId,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeLogoUrl,
        awayLogoUrl,
        rating,
        dateRated: new Date(),
        gameDate: new Date(currentDate),
      };

      addRating(ratedGame);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Date navigation controls */}
      <div className="flex justify-between items-center mb-6 max-w-[660px] mx-auto">
        <button
          onClick={goToPreviousDay}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
        >
          <FaChevronLeft />
        </button>

        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">
              {formatDateForDisplay(currentDate)}
            </h2>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <FaCalendarAlt className="text-blue-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <button
            onClick={goToToday}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextDay}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Game list */}
      {isLoading ? (
        <div className="text-center py-8">Loading games...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error loading games</div>
      ) : data && data.events && data.events.length > 0 ? (
        <div>
          {data.events.map((event: ESPNEvent) => {
            // Check if this is an All-Star Game
            if (isAllStarGame(event)) {
              // Special handling for All-Star Game
              const competitors = event.competitions[0].competitors || [];

              // Extract team info - All-Star games typically have team names like "Team LeBron" or "Team Durant"
              const homeTeam = competitors[0]?.team || {
                name: "Team 1",
                logo: "",
              };
              const awayTeam = competitors[1]?.team || {
                name: "Team 2",
                logo: "",
              };

              // Use team logos if available, otherwise use placeholder
              const homeLogoUrl =
                homeTeam.logo ||
                "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png";
              const awayLogoUrl =
                awayTeam.logo ||
                "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png";

              const homeScore = competitors[0].score || "0";
              const awayScore = competitors[1].score || "0";

              const gameId = event.id;
              const gameStatus = event.competitions[0].status?.type;

              return (
                <div
                  key={gameId}
                  className="flex flex-row my-2 p-1 border border-gray-200 rounded-md max-w-[660px] min-w-[460px] mx-auto justify-between items-center"
                >
                  <div className="flex flex-row items-center">
                    {/* Team Logos - Fixed width column with proper vertical alignment */}
                    <div className="flex flex-col justify-between w-12 h-20">
                      <div className="flex items-center justify-center h-10">
                        <img
                          src={homeLogoUrl}
                          alt={`${homeTeam?.name || "Team"} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center h-10">
                        <img
                          src={awayLogoUrl}
                          alt={`${awayTeam?.name || "Team"} logo`}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    </div>

                    {/* Team Scores - Fixed width column with matching vertical spacing */}
                    <div className="flex flex-col justify-between h-20 w-7 items-center">
                      <p
                        className={`${
                          homeScore > awayScore ? "font-semibold" : ""
                        } text-right h-10 flex items-center`}
                      >
                        {homeScore}
                      </p>
                      <p
                        className={`${
                          awayScore > homeScore ? "font-semibold" : ""
                        } text-right h-10 flex items-center`}
                      >
                        {awayScore}
                      </p>
                    </div>

                    {/* Team Names - Fixed width column with matching vertical spacing */}
                    <div className="flex flex-col justify-between h-20 w-24 ml-4">
                      <p
                        className={`${
                          homeScore > awayScore ? "font-semibold" : ""
                        } h-10 flex items-center text-sm`}
                      >
                        {homeTeam.name}
                      </p>
                      <p
                        className={`${
                          awayScore > homeScore ? "font-semibold" : ""
                        } h-10 flex items-center text-sm`}
                      >
                        {awayTeam.name}
                      </p>
                    </div>

                    {/* All-Star Game Label instead of records */}
                    <div className="flex items-center justify-center w-16">
                      <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs text-center">
                        All-Star
                      </span>
                    </div>

                    {/* Game Status */}
                    <div className="flex items-center justify-center w-12">
                      {gameStatus?.state === "in" ? (
                        <div className="flex flex-col items-center">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs text-center w-full">
                            Live
                          </span>
                          <span className="text-xs mt-1">
                            {event.competitions[0].status?.displayClock}{" "}
                            {event.competitions[0].status?.period}Q
                          </span>
                        </div>
                      ) : gameStatus?.description === "Final" ? (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs text-center">
                          Final
                        </span>
                      ) : (
                        <span className="text-xs">
                          {event.competitions[0].status?.type?.shortDetail ||
                            ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex flex-row items-center justify-center mr-1">
                    {[1, 2, 3, 4, 5].map((starNumber) => {
                      const gameId = event.id;
                      const gameRating = ratings[gameId] || 0;
                      const hoverRating =
                        hoveredStars?.gameId === gameId
                          ? hoveredStars.rating
                          : 0;
                      const displayRating = hoverRating || gameRating;

                      // Determine if this star should be full, half, or empty
                      const isFull = starNumber <= Math.floor(displayRating);
                      const isHalf =
                        !isFull &&
                        starNumber === Math.ceil(displayRating) &&
                        displayRating % 1 !== 0;

                      return (
                        <div
                          key={`${gameId}-star-container-${starNumber}`}
                          className="relative"
                          style={{ width: size, height: size }}
                          onMouseMove={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const starWidth = rect.width;
                            const position = e.clientX - rect.left;
                            // If mouse is on left half of star, make it a half star
                            const rating =
                              position < starWidth / 2
                                ? starNumber - 0.5
                                : starNumber;
                            setHoveredStars({ gameId, rating });
                          }}
                          onMouseLeave={() => setHoveredStars(null)}
                          onClick={() => {
                            const rating =
                              hoveredStars?.gameId === gameId
                                ? hoveredStars.rating
                                : 0;
                            handleRating(gameId, rating, event);
                          }}
                        >
                          {/* Base empty star */}
                          <FaStar
                            className={`star-${gameId}-${starNumber}`}
                            color="#e4e5e9"
                            size={size}
                            style={{ cursor: "pointer" }}
                          />

                          {/* Full star overlay */}
                          {isFull && (
                            <FaStar
                              className={`star-full-${gameId}-${starNumber}`}
                              color="#ffc107"
                              size={size}
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                cursor: "pointer",
                              }}
                            />
                          )}

                          {/* Half star overlay */}
                          {isHalf && (
                            <FaStarHalfAlt
                              className={`star-half-${gameId}-${starNumber}`}
                              color="#ffc107"
                              size={size}
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                cursor: "pointer",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Regular game rendering logic
            const homeTeam = event.competitions[0]?.competitors?.[0]?.team || {
              abbreviation: "N/A",
              logo: "",
            };
            const awayTeam = event.competitions[0]?.competitors?.[1]?.team || {
              abbreviation: "N/A",
              logo: "",
            };
            const homeLogoUrl = homeTeam.logo;
            const awayLogoUrl = awayTeam.logo;

            const gameId = event.id;
            /* Keep for data functionality
            const gameRating = ratings[gameId] || null;
            */
            return (
              <div
                key={gameId}
                className="flex flex-row my-2 p-1 border border-gray-200 rounded-md max-w-[660px] min-w-[460px] mx-auto justify-between items-center"
              >
                <div className="flex flex-row items-center">
                  {/* Team Logos - Fixed width column with proper vertical alignment */}
                  <div className="flex flex-col justify-between w-12 h-20">
                    <div className="flex items-center justify-center h-10">
                      <img
                        src={homeLogoUrl}
                        alt={`${homeTeam.abbreviation} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center h-10">
                      <img
                        src={awayLogoUrl}
                        alt={`${awayTeam.abbreviation} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>

                  {/* Team Scores - Fixed width column with matching vertical spacing */}
                  <div className="flex flex-col justify-between h-20 w-7 items-center">
                    <p
                      className={`${
                        Number(event.competitions[0]?.competitors?.[0]?.score) >
                        Number(event.competitions[0]?.competitors?.[1]?.score)
                          ? "font-semibold"
                          : ""
                      } text-right h-10 flex items-center`}
                    >
                      {event.competitions[0]?.competitors?.[0]?.score}
                    </p>
                    <p
                      className={`${
                        Number(event.competitions[0]?.competitors?.[1]?.score) >
                        Number(event.competitions[0]?.competitors?.[0]?.score)
                          ? "font-semibold"
                          : ""
                      } text-right h-10 flex items-center`}
                    >
                      {event.competitions[0]?.competitors?.[1]?.score}
                    </p>
                  </div>

                  {/* Team Names - Fixed width column with matching vertical spacing */}
                  <div className="flex flex-col justify-between h-20 w-16 ml-4">
                    <p
                      className={`${
                        Number(event.competitions[0]?.competitors?.[0]?.score) >
                        Number(event.competitions[0]?.competitors?.[1]?.score)
                          ? "font-semibold"
                          : ""
                      } h-10 flex items-center`}
                    >
                      {homeTeam.abbreviation}
                    </p>
                    <p
                      className={`${
                        Number(event.competitions[0]?.competitors?.[1]?.score) >
                        Number(event.competitions[0]?.competitors?.[0]?.score)
                          ? "font-semibold"
                          : ""
                      } h-10 flex items-center`}
                    >
                      {awayTeam.abbreviation}
                    </p>
                  </div>

                  {/* Team Records - Fixed width column with matching vertical spacing */}
                  <div className="flex flex-col justify-between h-20 w-14">
                    <p className="h-10 flex items-center">
                      {event.competitions[0]?.competitors?.[0]?.records?.[0]
                        ?.summary || ""}
                    </p>
                    <p className="h-10 flex items-center">
                      {event.competitions[0]?.competitors?.[1]?.records?.[0]
                        ?.summary || ""}
                    </p>
                  </div>

                  {/* Live Indicator */}
                  <div className="flex items-center justify-center ml-4 w-30">
                    {event.competitions[0].status?.type?.state === "in" ? (
                      <div className="flex flex-col items-center">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs text-center w-full">
                          Live
                        </span>
                        <span className="text-xs mt-1">
                          {event.competitions[0].status?.displayClock}{" "}
                          {event.competitions[0].status?.period}Q
                        </span>
                      </div>
                    ) : event.competitions[0].status?.type?.description ===
                      "Final" ? (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs text-center">
                        Final
                      </span>
                    ) : (
                      <span className="text-xs">
                        {event.competitions[0].status?.type?.shortDetail || ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex flex-row items-center justify-center mr-1">
                  {[1, 2, 3, 4, 5].map((starNumber) => {
                    const gameRating = ratings[gameId] || 0;
                    const hoverRating =
                      hoveredStars?.gameId === gameId ? hoveredStars.rating : 0;
                    const displayRating = hoverRating || gameRating;

                    // Determine if this star should be full, half, or empty
                    const isFull = starNumber <= Math.floor(displayRating);
                    const isHalf =
                      !isFull &&
                      starNumber === Math.ceil(displayRating) &&
                      displayRating % 1 !== 0;

                    return (
                      <div
                        key={`${gameId}-star-container-${starNumber}`}
                        className="relative"
                        style={{ width: size, height: size }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const starWidth = rect.width;
                          const position = e.clientX - rect.left;
                          // If mouse is on left half of star, make it a half star
                          const rating =
                            position < starWidth / 2
                              ? starNumber - 0.5
                              : starNumber;
                          setHoveredStars({ gameId, rating });
                        }}
                        onMouseLeave={() => setHoveredStars(null)}
                        onClick={() => {
                          const rating =
                            hoveredStars?.gameId === gameId
                              ? hoveredStars.rating
                              : 0;
                          handleRating(gameId, rating, event); // Pass the event object here
                        }}
                      >
                        {/* Base empty star */}
                        <FaStar
                          className={`star-${gameId}-${starNumber}`}
                          color="#e4e5e9"
                          size={size}
                          style={{ cursor: "pointer" }}
                        />

                        {/* Full star overlay */}
                        {isFull && (
                          <FaStar
                            className={`star-full-${gameId}-${starNumber}`}
                            color="#ffc107"
                            size={size}
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              cursor: "pointer",
                            }}
                          />
                        )}

                        {/* Half star overlay */}
                        {isHalf && (
                          <FaStarHalfAlt
                            className={`star-half-${gameId}-${starNumber}`}
                            color="#ffc107"
                            size={size}
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              cursor: "pointer",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">No games scheduled for this date</div>
      )}
    </div>
  );
};

const getGames = async (date: Date) => {
  const formattedDate = formatDateForAPI(date);
  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${formattedDate}`
  );
  return await response.json();
};

export default Search;
