// main.js
import { capitalizeFirstLetter } from './utils.js';
import { renderBackpack, attachBackpackItemListeners } from './inventory.js';
import { equipItem, unequipItem, showItemOptions } from './equipment.js';
import { gatherResource, applySkillBuff } from './skills.js';

window.windowAllItems = []; // Przechowywanie wszystkich przedmiotów

document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('startGameBtn');
    const sidebar = document.getElementById('sidebar');
    const profileSection = document.getElementById('profile');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalItemList = document.getElementById('modal-item-list');

    startGameBtn.addEventListener('click', () => {
        alert('Gra się zaczyna!');
    });

    // Zamknięcie modala po kliknięciu na "x"
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Zamknięcie modala po kliknięciu poza jego treścią
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Ładowanie komponentu sidebar.html
    fetch('components/sidebar.html')
        .then(response => response.text())
        .then(data => {
            sidebar.innerHTML = data;
        })
        .catch(error => {
            console.error('Błąd podczas ładowania sidebar.html:', error);
        });

    // Ładowanie komponentu profile.html
    fetch('components/profile.html')
        .then(response => response.text())
        .then(data => {
            profileSection.innerHTML = data;
            initializeProfile();
            renderProfile();
            attachSlotEventListeners(); // Przypisanie listenerów po renderowaniu
        })
        .catch(error => {
            console.error('Błąd podczas ładowania profile.html:', error);
        });

    // Funkcja do pobierania przedmiotów z JSON
    fetch('data/items.json')
        .then(response => response.json())
        .then(data => {
            const items = data.items;
            windowAllItems = items; // Przechowywanie wszystkich przedmiotów
            console.log('Loaded items:', windowAllItems); // Debugging
            renderBackpack(items);
        })
        .catch(error => {
            console.error('Błąd podczas ładowania items.json:', error);
        });

    // Funkcja do pobierania surowców z JSON
    fetch('data/resources.json')
        .then(response => response.json())
        .then(data => {
            const resources = data.resources;
            renderResources(resources);
        })
        .catch(error => {
            console.error('Błąd podczas ładowania resources.json:', error);
        });

    // Inicjalizacja Profilu Gracza
    function initializeProfile() {
        // Przykładowe dane gracza (na razie statyczne)
        const player = {
            name: "Gracz",
            level: 1,
            hp: 100,
            mp: 50,
            energy: 50,
            strength: 5,
            defense: 5,
            intelligence: 5,
            agility: 5,
            luck: 5,
            slots: {
                Head: null,
                Chest: null,
                Legs: null,
                Weapon: null,
                Shield: null,
                Accessory: null
            },
            resources: {
                drewno: 0,
                kamien: 0,
                zelazo: 0
            },
            skills: {
                woodcutting: { level: 1, experience: 0 },
                mining: { level: 1, experience: 0 },
                farming: { level: 1, experience: 0 },
                traveling: { level: 1, experience: 0 }
            }
        };

        // Przechowywanie danych gracza w localStorage
        if (!localStorage.getItem('player')) {
            localStorage.setItem('player', JSON.stringify(player));
        }

        // Renderowanie danych gracza
        renderProfile();
    }

    // Renderowanie Profilu Gracza
    function renderProfile() {
        const player = JSON.parse(localStorage.getItem('player'));
        if (player) {
            document.getElementById('player-name').textContent = player.name;
            document.getElementById('player-level').textContent = player.level;
            document.getElementById('player-hp').textContent = player.hp;
            document.getElementById('player-mp').textContent = player.mp;
            document.getElementById('player-energy').textContent = player.energy;
            document.getElementById('player-strength').textContent = player.strength;
            document.getElementById('player-defense').textContent = player.defense;
            document.getElementById('player-intelligence').textContent = player.intelligence;
            document.getElementById('player-agility').textContent = player.agility;
            document.getElementById('player-luck').textContent = player.luck;

            // Renderowanie slotów ekwipunku
            for (let slot in player.slots) {
                const slotElement = document.getElementById(`slot-${slot}`);
                if (player.slots[slot]) {
                    slotElement.textContent = `${player.slots[slot].name}`;
                } else {
                    slotElement.textContent = 'Brak';
                }
            }

            // Renderowanie surowców i umiejętności
            renderResourcesUI(player.resources);
            renderSkills(player.skills);
        }
    }

    // Funkcja do renderowania surowców w UI
    function renderResources(resources) {
        const playerResources = document.getElementById('player-resources');
        playerResources.innerHTML = '';
        resources.forEach(resource => {
            const resourceKey = resource.name.toLowerCase(); // 'drewno', 'kamien', 'zelazo'
            const li = document.createElement('li');
            li.innerHTML = `<strong>${capitalizeFirstLetter(resource.name)}:</strong> <span id="resource-${resourceKey}">0</span>`;
            playerResources.appendChild(li);
        });
    }

    function renderResourcesUI(resources) {
        for (let resource in resources) {
            const resourceElement = document.getElementById(`resource-${resource}`);
            if (resourceElement) {
                resourceElement.textContent = resources[resource];
            }
        }
    }

    // Funkcja do renderowania umiejętności w UI
    function renderSkills(skills) {
        const playerSkills = document.getElementById('player-skills');
        playerSkills.innerHTML = '';
        for (let skill in skills) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${capitalizeFirstLetter(skill)}:</strong> <span id="skill-${skill}">${skills[skill].level}</span> <button id="gather-${skill}" class="gather-btn">Zbieraj</button>`;
            playerSkills.appendChild(li);
        }

        // Event delegation dla przycisków "Zbieraj"
        playerSkills.addEventListener('click', (event) => {
            if (event.target && event.target.matches('button.gather-btn')) {
                const skill = event.target.id.replace('gather-', '');
                gatherResource(skill);
            }
        });
    }

    // Funkcja do dodawania event listenerów do slotów ekwipunku (przełączona na event delegation)
    function attachSlotEventListeners() {
        const equipmentList = document.getElementById('equipment-list');

        // Użycie event delegation
        equipmentList.addEventListener('click', (event) => {
            if (event.target && event.target.matches('button.slot-item')) {
                const slotName = event.target.id.replace('slot-', '');
                const player = JSON.parse(localStorage.getItem('player'));
                const equippedItem = player.slots[slotName];
                if (equippedItem) {
                    // Pokaż opcje dla wyposażonego przedmiotu
                    showItemOptions(equippedItem, slotName);
                } else {
                    // Pokaż opcje dla pustego slotu
                    openInventory(slotName);
                }
            }
        });
    }

    // Funkcja do otwierania inwentarza dla konkretnego slotu (przez modal)
    window.openInventory = function(slot) {
        console.log(`Otwieranie inwentarza dla slotu: ${slot}`);
        const player = JSON.parse(localStorage.getItem('player'));
        const availableItems = windowAllItems.filter(item => item.type === slot && item.equipable);

        if (availableItems.length === 0) {
            alert(`Brak przedmiotów typu ${capitalizeFirstLetter(slot)}`);
            return;
        }

        // Wypełnienie listy przedmiotów w modalu
        modalItemList.innerHTML = ''; // Wyczyść poprzednią listę
        availableItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.id}. ${item.name} - ${item.description}`;
            li.dataset.id = item.id;
            li.classList.add('modal-item');
            modalItemList.appendChild(li);
        });

        // Dodanie event listenerów do nowych elementów w modalu
        modalItemList.querySelectorAll('.modal-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = parseInt(item.dataset.id);
                const selectedItem = availableItems.find(i => i.id === itemId);
                if (selectedItem) {
                    console.log(`Wybrano przedmiot: ${selectedItem.name}`);
                    equipItem(selectedItem.id, slot);
                    modal.style.display = 'none'; // Zamknij modal
                } else {
                    alert('Nieprawidłowy wybór.');
                }
            });
        });

        // Wyświetlenie modala
        modal.style.display = 'block';
    };

    // Funkcja do wyświetlania opcji dla przedmiotu
    window.showItemOptions = function(item, slot) {
        console.log(`Wyświetlanie opcji dla przedmiotu: ${item.name} w slocie: ${slot}`);
        // Możemy również użyć modala do wyświetlenia opcji
        // Na przykład: opcja "Odpięj"
        const option = confirm(`Chcesz odpiąć ${item.name} z slotu ${slot}?`);
        if (option) {
            unequipItem(item.id, slot);
        }
    };

    // Funkcja do zbierania surowców
    window.gatherResource = function(skill) {
        gatherResource(skill);
    };

    // Export funkcji renderProfile do window dla innych modułów
    window.renderProfile = renderProfile;
});
