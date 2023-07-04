import '../css/style.css';


const searchForm = document.getElementById('search-form');
    const searchBoxInt = document.querySelector('.search-box-int');
    const resultsContainer = document.getElementById('results');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalDescription = document.getElementById('modalDescription');

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const category = searchBoxInt.value.trim();
      searchBooksByCategory(category);
    });

    function searchBooksByCategory(category) {
      const apiUrl = `https://openlibrary.org/subjects/${encodeURIComponent(category)}.json?limit=10`;

      axios.get(apiUrl)
        .then(function (response) {
          displayResults(response.data);
        })
        .catch(function (error) {
          console.error(error);
          resultsContainer.innerHTML = 'An error occurred during the search.';
        });
    }

    function displayResults(data) {
      resultsContainer.innerHTML = '';

      if (data.works.length === 0) {
        resultsContainer.innerHTML = 'No results found.';
        return;
      }

      data.works.forEach(function (work) {
        const title = work.title;
        const author = work.authors ? work.authors[0].name : 'Autore sconosciuto';
        const coverId = work.cover_id;

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('book-result');
        resultDiv.innerHTML = `
          <h3>${title}</h3>
          <p>Autore: ${author}</p>
          <div class="book-cover"></div>
          <div class="button-container">
            <button class="description-button">Show description</button>
            <button class="close-button">X</button>
          </div>
          <div class="description"></div>
        `;
        resultsContainer.appendChild(resultDiv);

        // Visualizza la copertina del libro
        if (coverId) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
          const bookCover = resultDiv.querySelector('.book-cover');
          bookCover.style.backgroundImage = `url('${coverUrl}')`;
        }

        // Mostra la descrizione del libro
        const descriptionButton = resultDiv.querySelector('.description-button');
        const descriptionDiv = resultDiv.querySelector('.description');
        const closeButton = resultDiv.querySelector('.close-button');
        closeButton.style.display = 'none';

        descriptionButton.addEventListener('click', function () {
          if (work.key) {
            const bookKey = work.key.replace('/works/', '');
            getBookDescription(bookKey)
              .then(function (description) {
                modalDescription.textContent = description;
                modal.style.display = 'block';
              })
              .catch(function (error) {
                console.error(error);
                descriptionDiv.textContent = 'Unable to retrieve book description.';
              });
          }
        });

        closeButton.addEventListener('click', function () {
          modalDescription.textContent = '';
          modal.style.display = 'none';
        });
      });
    }

    function getBookDescription(bookKey) {
      const apiUrl = `https://openlibrary.org/works/${encodeURIComponent(bookKey)}.json`;

      return axios.get(apiUrl)
        .then(function (response) {
          return response.data.description || 'Nessuna descrizione disponibile.';
        });
    }

    closeModalButton.addEventListener('click', function () {
      modalDescription.textContent = '';
      modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
      if (event.target === modal) {
        modalDescription.textContent = '';
        modal.style.display = 'none';
      }
    });