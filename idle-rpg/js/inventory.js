// inventory.js
import { equipItem } from './equipment.js';

export function renderBackpack(items) {
    const backpackItems = document.getElementById('backpack-items');
    backpackItems.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.type})`;
        li.dataset.id = item.id;
        li.classList.add('backpack-item');
        backpackItems.appendChild(li);
    });
    attachBackpackItemListeners();
}

export function attachBackpackItemListeners() {
    const backpackItemsList = document.querySelectorAll('.backpack-item');
    backpackItemsList.forEach(item => {
        item.addEventListener('click', () => {
            const itemId = parseInt(item.dataset.id);
            const selectedItem = window.windowAllItems.find(i => i.id === itemId);
            if (selectedItem && selectedItem.equipable) {
                // Otwórz inwentarz dla odpowiedniego slotu
                const slot = selectedItem.type;
                equipItem(selectedItem.id, slot);
            } else {
                alert('Ten przedmiot nie może być założony.');
            }
        });
    });
}
