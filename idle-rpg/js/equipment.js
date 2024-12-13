// equipment.js
import { capitalizeFirstLetter } from './utils.js';
import { attachBackpackItemListeners } from './inventory.js';

export function equipItem(id, slotOverride = null) {
    const item = window.windowAllItems.find(i => i.id === id);
    if (!item) {
        alert('Przedmiot nie został znaleziony.');
        return;
    }

    const player = JSON.parse(localStorage.getItem('player'));

    // Określenie slotu na podstawie typu przedmiotu
    const slot = slotOverride || item.type;

    // Sprawdzenie, czy slot istnieje
    if (!player.slots.hasOwnProperty(slot)) {
        alert(`Nieznany slot: ${slot}`);
        return;
    }

    // Jeśli slot jest już zajęty, odpięcie obecnego przedmiotu
    if (player.slots[slot]) {
        unequipItem(player.slots[slot].id, slot);
    }

    // Założenie nowego przedmiotu
    player.slots[slot] = item;

    // Dodawanie statystyk przedmiotu do profilu
    for (let stat in item.stats) {
        if (player.hasOwnProperty(stat)) {
            player[stat] += item.stats[stat];
        } else {
            player[stat] = item.stats[stat];
        }
    }

    // Przeniesienie przedmiotu z plecaka do slotu
    removeItemFromBackpack(id);

    // Aktualizacja danych gracza
    localStorage.setItem('player', JSON.stringify(player));
    window.renderProfile(); // Wywołanie renderProfile poprzez window
}

export function unequipItem(id, slot) {
    const player = JSON.parse(localStorage.getItem('player'));
    const item = player.slots[slot];

    if (item && item.id === id) {
        // Odejmowanie statystyk przedmiotu
        for (let stat in item.stats) {
            if (player.hasOwnProperty(stat)) {
                player[stat] -= item.stats[stat];
                if (player[stat] < 0) player[stat] = 0;
            }
        }

        // Usuwanie przedmiotu z slotu
        player.slots[slot] = null;

        // Dodawanie przedmiotu z powrotem do plecaka
        addItemToBackpack(item.id);

        // Aktualizacja danych gracza
        localStorage.setItem('player', JSON.stringify(player));
        window.renderProfile(); // Wywołanie renderProfile poprzez window
    }
}

function removeItemFromBackpack(id) {
    const backpackItems = document.querySelectorAll('.backpack-item');
    backpackItems.forEach(item => {
        if (parseInt(item.dataset.id) === id) {
            item.remove();
        }
    });
}

function addItemToBackpack(id) {
    const item = window.windowAllItems.find(i => i.id === id);
    if (item) {
        const backpackItems = document.getElementById('backpack-items');
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.type})`;
        li.dataset.id = item.id;
        li.classList.add('backpack-item');
        backpackItems.appendChild(li);
        attachBackpackItemListeners();
    }
}

// Funkcja do wyświetlania opcji dla przedmiotu
export function showItemOptions(item, slot) {
    const options = ['Odpięj'];
    let optionsList = `Opcje dla ${item.name}:\n`;
    options.forEach((option, index) => {
        optionsList += `${index + 1}. ${option}\n`;
    });

    // Użycie modala zamiast prompt
    // Możemy otworzyć modal z opcjami
    const modal = document.getElementById('modal');
    const modalItemList = document.getElementById('modal-item-list');
    modalItemList.innerHTML = ''; // Wyczyść poprzednią listę

    options.forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${option}`;
        li.dataset.option = option;
        li.classList.add('modal-option');
        modalItemList.appendChild(li);
    });

    // Dodanie event listenerów do opcji
    modalItemList.querySelectorAll('.modal-option').forEach(optionElement => {
        optionElement.addEventListener('click', () => {
            const selectedOption = optionElement.dataset.option;
            if (selectedOption === 'Odpięj') {
                unequipItem(item.id, slot);
                modal.style.display = 'none'; // Zamknij modal
            }
            // Możesz dodać więcej opcji w przyszłości
        });
    });

    // Wyświetlenie modala
    modal.style.display = 'block';
}
