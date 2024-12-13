// skills.js
import { capitalizeFirstLetter } from './utils.js';

export function gatherResource(skill) {
    let player = JSON.parse(localStorage.getItem('player'));
    if (player) {
        // Definicja surowców związanych z umiejętnością
        const skillToResource = {
            woodcutting: 'drewno',
            mining: 'kamien',
            farming: 'drewno',      // Możesz dostosować
            traveling: 'zelazo'     // Możesz dostosować
        };

        const resourceKey = skillToResource[skill];
        if (resourceKey) {
            // Zbieranie surowca
            player.resources[resourceKey] += 1;

            // Dodawanie doświadczenia do umiejętności
            player.skills[skill].experience += 1;

            // Sprawdzanie poziomu umiejętności
            const experienceToLevel = 10;
            if (player.skills[skill].experience >= experienceToLevel) {
                player.skills[skill].level += 1;
                player.skills[skill].experience = 0;
                alert(`Twoja umiejętność ${capitalizeFirstLetter(skill)} osiągnęła poziom ${player.skills[skill].level}!`);
            }

            // Przyznawanie bonusów na podstawie poziomu umiejętności
            applySkillBuff(skill, player.skills[skill].level);

            // Aktualizacja danych gracza
            localStorage.setItem('player', JSON.stringify(player));
            window.renderProfile(); // Wywołanie renderProfile poprzez window
        }
    }
}

export function applySkillBuff(skill, level) {
    let player = JSON.parse(localStorage.getItem('player'));
    if (player) {
        switch (skill) {
            case 'woodcutting':
                player.energy += level; // Przykładowy buff
                break;
            case 'mining':
                player.strength += level; // Przykładowy buff
                break;
            case 'farming':
                player.luck += level; // Przykładowy buff
                break;
            case 'traveling':
                player.agility += level; // Przykładowy buff
                break;
            default:
                break;
        }
        localStorage.setItem('player', JSON.stringify(player));
    }
}
