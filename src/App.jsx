import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faGlassMartiniAlt,
  faTimes,
  faGlassWhiskey,
  faListUl,
  faChevronRight,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../src/App.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cocktails, setCocktails] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  const quickTags = ["vodka", "gin", "rum", "tequila"];

  const searchCocktails = async (ingredient) => {
    setIsLoading(true);
    setError(null);
    setCocktails([]);

    try {
      const baseUrl =
        "https://cors-anywhere.herokuapp.com/https://www.thecocktaildb.com/api/json/v1/1";
      const response = await fetch(
        `${baseUrl}/filter.php?i=${encodeURIComponent(ingredient)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.drinks) {
        setError("No se encontraron cócteles con ese ingrediente");
        setIsLoading(false);
        return;
      }

      // Fetch detailed information for each cocktail
      const detailedCocktails = await Promise.all(
        data.drinks.map(async (drink) => {
          const detailResponse = await fetch(
            `${baseUrl}/lookup.php?i=${drink.idDrink}`
          );
          if (!detailResponse.ok) {
            throw new Error("Error fetching cocktail details");
          }
          const detailData = await detailResponse.json();
          return detailData.drinks[0];
        })
      );

      setCocktails(detailedCocktails);
    } catch (err) {
      setError("Error al buscar cócteles. Por favor, intenta de nuevo.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchCocktails(searchTerm.trim());
    }
  };

  const getIngredientsList = (cocktail) => {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`];
      const measure = cocktail[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push({ ingredient, measure });
      }
    }
    return ingredients;
  };

  return (
    <div className="container">
      <header>
        <h1>Explorador de Cócteles</h1>
        <p>
          Descubre deliciosas recetas de cócteles basadas en tu bebida favorita
        </p>
      </header>

      <div className="search-container">
        <div className="search-box">
          <form onSubmit={handleSearch} className="search-group">
            <div className="search-input-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: vodka, ron, tequila..."
              />
            </div>
            <button type="submit">
              <FontAwesomeIcon icon={faGlassMartiniAlt} /> Buscar
            </button>
          </form>
          <div className="quick-tags">
            <span>Prueba con:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                className="tag-btn"
                onClick={() => {
                  setSearchTerm(tag);
                  searchCocktails(tag);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="state-container">
          <div className="loading-spinner"></div>
          <p>Buscando recetas...</p>
        </div>
      )}

      {error && (
        <div className="state-container">
          <FontAwesomeIcon icon={faGlassMartiniAlt} className="error-icon" />
          <h3>No se encontraron resultados</h3>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && cocktails.length === 0 && (
        <div className="state-container">
          <FontAwesomeIcon icon={faGlassMartiniAlt} className="initial-icon" />
          <h3>Busca cócteles por ingrediente</h3>
          <p>
            Ingresa una bebida alcohólica como vodka, ron o tequila para
            descubrir recetas de cócteles.
          </p>
        </div>
      )}

      {!isLoading && !error && cocktails.length > 0 && (
        <div className="cocktails-grid">
          {cocktails.map((cocktail) => (
            <div key={cocktail.idDrink} className="cocktail-card fade-in">
              <div className="cocktail-image">
                <img src={cocktail.strDrinkThumb} alt={cocktail.strDrink} />
              </div>
              <div className="cocktail-content">
                <h3>{cocktail.strDrink}</h3>
                <div className="cocktail-meta">
                  <span>
                    <FontAwesomeIcon icon={faGlassWhiskey} />{" "}
                    {cocktail.strAlcoholic}
                  </span>
                  <span className="separator">•</span>
                  <span>
                    <FontAwesomeIcon icon={faListUl} />{" "}
                    {getIngredientsList(cocktail).length} ingredientes
                  </span>
                </div>
                <p className="cocktail-ingredients">
                  {getIngredientsList(cocktail)
                    .map(({ ingredient }) =>
                      ingredient.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={ingredient} className="highlight">
                          {ingredient}
                        </span>
                      ) : (
                        ingredient
                      )
                    )
                    .reduce(
                      (prev, curr, idx) =>
                        idx === 0 ? [curr] : [...prev, ", ", curr],
                      []
                    )}
                </p>
                <div className="cocktail-footer">
                  <button
                    className="view-details"
                    onClick={() => setSelectedCocktail(cocktail)}
                  >
                    Ver detalles <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <span className="cocktail-category">
                    {cocktail.strCategory}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCocktail && (
        <div className="modal" onClick={() => setSelectedCocktail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCocktail.strDrink}</h3>
              <button
                className="close-modal"
                onClick={() => setSelectedCocktail(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <div className="modal-image">
                  <img
                    src={selectedCocktail.strDrinkThumb}
                    alt={selectedCocktail.strDrink}
                  />
                </div>
                <div className="modal-info">
                  <div className="info-group">
                    <h4>Categoría</h4>
                    <p>
                      {selectedCocktail.strCategory} •{" "}
                      {selectedCocktail.strAlcoholic}
                    </p>
                  </div>
                  <div className="info-group">
                    <h4>Vaso recomendado</h4>
                    <p>{selectedCocktail.strGlass}</p>
                  </div>
                  <div className="info-group">
                    <h4>Instrucciones</h4>
                    <p>{selectedCocktail.strInstructions}</p>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <h4>Ingredientes</h4>
                <div className="ingredients-grid">
                  {getIngredientsList(selectedCocktail).map(
                    ({ ingredient, measure }, index) => (
                      <div key={index} className="ingredient-item">
                        <div className="ingredient-icon">
                          <FontAwesomeIcon icon={faCircle} />
                        </div>
                        <div>
                          <div className="ingredient-name">{ingredient}</div>
                          {measure && (
                            <div className="ingredient-measure">{measure}</div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {selectedCocktail.strInstructionsES && (
                <div className="instructions-es">
                  <h4>Instrucciones en Español</h4>
                  <p>{selectedCocktail.strInstructionsES}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>
          Datos proporcionados por{" "}
          <a
            href="https://www.thecocktaildb.com/"
            target="_blank"
            rel="noopener"
          >
            TheCocktailDB
          </a>
        </p>
        <p>© 2023 Explorador de Cócteles</p>
      </footer>
    </div>
  );
}

export default App;
