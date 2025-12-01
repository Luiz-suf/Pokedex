const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon';
const TYPE_API_URL = 'https://pokeapi.co/api/v2/type';

// Constantes para Números Mágicos
const POKEMONS_PER_PAGE = 20;
const MAX_POKEMONS_BY_TYPE = 100;
const FIRST_PAGE_NUMBER = 1;

// Variáveis de Estado (Renomeadas para clareza)
let allFetchedPokemons = []; // 'a' - Armazena Pokémons da requisição
let currentPokemonsToRender = []; // 'b' - Lista a ser filtrada e renderizada
let currentPage = FIRST_PAGE_NUMBER; // 'c' - Página atual
let currentSearchTerm = ''; // 'e' - Termo de busca/filtro
let currentTypeFilter = ''; // 'f1' - Filtro de tipo

// Referências aos Elementos (para evitar buscar o DOM repetidamente)
const loadingElement = document.getElementById('loading');
const pokemonGridElement = document.getElementById('pokemonGrid');
const typeFilterElement = document.getElementById('typeFilter');
const pageInfoElement = document.getElementById('pageInfo');
const prevBtnElement = document.getElementById('prevBtn');
const nextBtnElement = document.getElementById('nextBtn');


/**
 * 1. Inicializa o skeleton loader no DOM.
 * @param {number} count - Número de skeletons a criar.
 */
function initializeSkeletonLoader(count) {
    loadingElement.innerHTML = '';
    for (let i = 0; i < count; i++) {
        loadingElement.innerHTML += '<div class="col-md-3"><div class="skeleton"></div></div>';
    }
}

/**
 * 2. Busca os tipos de Pokémons e popula o filtro de seleção.
 */
async function populateTypeFilter() {
    try {
        const response = await fetch(TYPE_API_URL);
        const data = await response.json();
        
        for (const type of data.results) {
            const option = document.createElement('option');
            option.value = type.name;
            // Capitaliza a primeira letra do nome do tipo
            option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeFilterElement.appendChild(option);
        }
    } catch (error) {
        console.error('Erro ao popular o filtro de tipos:', error);
        // Não usamos alert em funções de fundo para não interromper a UX
    }
}

/**
 * Funções de controle: Inicia a aplicação: prepara o loader, popula os filtros e carrega os dados.
 */
async function initializeApplication() {
    initializeSkeletonLoader(POKEMONS_PER_PAGE); // Prepara o loader
    await populateTypeFilter(); // Popula o filtro
    await loadPaginatedPokemons(); // Carrega os dados
}

/**
 * 3. Gerencia a visibilidade do loader e da grid de Pokémons.
 * @param {boolean} isLoading - Se está carregando (true) ou mostrando a grid (false).
 */
function toggleLoadingState(isLoading) {
    loadingElement.style.display = isLoading ? 'flex' : 'none';
    pokemonGridElement.style.display = isLoading ? 'none' : 'flex';
}

/**
 * 4. Faz o fetch de uma lista de URLs de Pokémons.
 * @param {string[]} urls - Array de URLs individuais de Pokémons.
 * @returns {Promise<Object[]>} - Promise que resolve para um array de objetos Pokémon.
 */
async function fetchPokemonDetails(urls) {
    const promises = urls.map(url => fetch(url));
    const responses = await Promise.all(promises);
    const pokemonDetails = await Promise.all(responses.map(res => res.json()));
    return pokemonDetails;
}

/**
 * 5. Carrega Pokémons com paginação (requisição padrão).
 */
async function loadPaginatedPokemons() {
    toggleLoadingState(true);
    
    try {
        const offset = (currentPage - FIRST_PAGE_NUMBER) * POKEMONS_PER_PAGE;
        const url = `${POKEMON_API_URL}?limit=${POKEMONS_PER_PAGE}&offset=${offset}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const pokemonUrls = data.results.map(pokemon => pokemon.url);
        allFetchedPokemons = await fetchPokemonDetails(pokemonUrls);
        
        // Atualiza a lista a ser renderizada
        currentPokemonsToRender = [...allFetchedPokemons];
        renderPokemonGrid();

    } catch (error) {
        console.error('Erro ao carregar Pokémons paginados:', error);
        alert('Erro ao carregar Pokémons!');
        toggleLoadingState(false);
    }
}

/**
 * 6. Carrega Pokémons filtrados por um tipo específico.
 */
async function loadPokemonsByType() {
    toggleLoadingState(true);

    try {
        const url = `${TYPE_API_URL}/${currentTypeFilter}`;
        const response = await fetch(url);
        const data = await response.json();

        // Limita o número de Pokémons a serem carregados
        const pokemonList = data.pokemon.slice(0, MAX_POKEMONS_BY_TYPE);
        const pokemonUrls = pokemonList.map(item => item.pokemon.url);
        
        allFetchedPokemons = await fetchPokemonDetails(pokemonUrls);
        
        // Atualiza a lista a ser renderizada
        currentPokemonsToRender = [...allFetchedPokemons];
        renderPokemonGrid();
        
    } catch (error) {
        console.error('Erro ao carregar Pokémons por tipo:', error);
        alert('Erro ao carregar Pokémons do tipo!');
        toggleLoadingState(false);
    }
}

/**
 * 7. Filtra a lista de Pokémons com base nos filtros ativos.
 * @param {Object[]} pokemons - A lista de pokémons base (currentPokemonsToRender).
 * @returns {Object[]} - A lista filtrada.
 */
function applyFilters(pokemons) {
    let filteredList = pokemons;
    
    if (currentSearchTerm !== '') {
        const searchLower = currentSearchTerm.toLowerCase();
        filteredList = filteredList.filter(p => {
            return p.name.toLowerCase().includes(searchLower) ||
                   p.id.toString().includes(searchLower);
        });
    }
    // O filtro de tipo já foi aplicado na função loadPokemonsByType
    
    return filteredList;
}

/**
 * 8. Gera o HTML de um card de Pokémon.
 * @param {Object} pokemon - O objeto Pokémon.
 * @returns {string} - A string HTML do card.
 */
function createPokemonCardHTML(pokemon) {
    // Capitaliza o nome
    const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    
    // Cria os badges de tipo
    let typeBadges = '';
    for (const typeInfo of pokemon.types) {
        const typeName = typeInfo.type.name;
        typeBadges += `<span class="badge type-${typeName}">${typeName}</span> `;
    }

    // Estrutura principal do card
    let html = `<div class="c" onclick="showDetails(${pokemon.id})">`;
    html += `<img src="${pokemon.sprites.front_default}" class="i" alt="${pokemon.name}">`;
    html += `<h5 class="text-center">#${pokemon.id} ${capitalizedName}</h5>`;
    html += `<div class="text-center">${typeBadges}</div></div>`;
    
    return html;
}

/**
 * 9. Renderiza a lista de Pokémons filtrada no grid.
 */
function renderPokemonGrid() {
    pokemonGridElement.innerHTML = ''; // Limpa o grid
    
    const filteredPokemons = applyFilters(currentPokemonsToRender);
    
    for (const pokemon of filteredPokemons) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'col-md-3';
        cardContainer.innerHTML = createPokemonCardHTML(pokemon);
        pokemonGridElement.appendChild(cardContainer);
    }
    
    updatePaginationAndInfo(filteredPokemons.length);
    toggleLoadingState(false); // Esconde o loader, mostra o grid
}

/**
 * 10. Atualiza a informação da página e o estado dos botões de paginação.
 * @param {number} displayedCount - O número de pokémons sendo exibidos.
 */
function updatePaginationAndInfo(displayedCount) {
    if (currentTypeFilter !== '') {
        pageInfoElement.textContent = `Mostrando ${displayedCount} pokémons por tipo`;
    } else {
        pageInfoElement.textContent = `Página ${currentPage}`;
    }

    // Desabilita botões se estiver filtrando por tipo (f1 !== '')
    const isTypeFilterActive = currentTypeFilter !== '';
    prevBtnElement.disabled = currentPage === FIRST_PAGE_NUMBER || isTypeFilterActive;
    nextBtnElement.disabled = isTypeFilterActive;
}
// Ivan refatorou até aqui
async function f() {
    e = document.getElementById('s').value;
    f1 = document.getElementById('typeFilter').value;

    // Se tem filtro de tipo, busca pokémons daquele tipo
    if(f1 !== '') {
        await lbt();
    } else {
        UNIFOR();
    }
}

function r() {
    document.getElementById('s').value = '';
    document.getElementById('typeFilter').value = '';
    e = '';
    f1 = '';
    c = 1;
    l();
}

function p1() {
    if(c > 1) {
        c--;
        if(f1 !== '') {
            UNIFOR();
        } else {
            l();
        }
    }
}

function p2() {
    c++;
    if(f1 !== '') {
        UNIFOR();
    } else {
        l();
    }
}

function x() {
    document.body.classList.toggle('dark');
}

async function Minhe_nha(id) {
    try {
        var xpto = await fetch(API + '/' + id);
        var p = await xpto.json();
        
        var zyz = await fetch(p.species.url);
        var m = await zyz.json();
        
        var desc = '';
        for(var i = 0; i < m.flavor_text_entries.length; i++) {
            if(m.flavor_text_entries[i].language.name === 'en') {
                desc = m.flavor_text_entries[i].flavor_text;
                break;
            }
        }
        
        document.getElementById('modalTitle').textContent = '#' + p.id + ' ' + p.name.charAt(0).toUpperCase() + p.name.slice(1);
        
        var ph = '<div class="row"><div class="col-md-6">';
        ph += '<div class="sprite-container">';
        ph += '<div><img src="' + p.sprites.front_default + '" alt="front"><p class="text-center">Normal</p></div>';
        ph += '<div><img src="' + p.sprites.front_shiny + '" alt="shiny"><p class="text-center">Shiny</p></div>';
        ph += '</div>';
        
        ph += '<p><strong>Tipo:</strong> ';
        for(var i = 0; i < p.types.length; i++) {
            ph += '<span class="badge type-' + p.types[i].type.name + '">' + p.types[i].type.name + '</span> ';
        }
        ph += '</p>';
        
        ph += '<p><strong>Altura:</strong> ' + (p.height / 10) + ' m</p>';
        ph += '<p><strong>Peso:</strong> ' + (p.weight / 10) + ' kg</p>';
        
        ph += '<p><strong>Habilidades:</strong> ';
        for(var i = 0; i < p.abilities.length; i++) {
            ph += p.abilities[i].ability.name;
            if(i < p.abilities.length - 1) ph += ', ';
        }
        ph += '</p>';
        
        ph += '</div><div class="col-md-6">';
        
        ph += '<p><strong>Descrição:</strong></p>';
        ph += '<p>' + desc.replace(/\f/g, ' ') + '</p>';
        
        ph += '<h6>Estatísticas:</h6>';
        for(var i = 0; i < p.stats.length; i++) {
            var stat = p.stats[i];
            var percentage = (stat.base_stat / 255) * 100;
            ph += '<div><small>' + stat.stat.name + ': ' + stat.base_stat + '</small>';
            ph += '<div class="stat-bar"><div class="stat-fill" style="width: ' + percentage + '%"></div></div></div>';
        }
        
        ph += '</div></div>';
        
        document.getElementById('modalBody').innerHTML = ph;
        
        var mod = new bootstrap.Modal(document.getElementById('m'));
        mod.show();
        
    } catch(error) {
        console.log('erro');
        alert('Erro ao carregar detalhes!');
    }
}

function mor() {
    var x = 10;
    var y = 20;
    return x + y;
}

var gmord = 'teste miqueias';

window.onload = function() {
    i();
};
