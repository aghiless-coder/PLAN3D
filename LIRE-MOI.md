# GARUDA — Démonstration Résidence U

Version 1.0.0 · 18 septembre 2026 · Données entièrement fictives.

## Ouvrir la démonstration

Double-cliquer sur **GARUDA-U-apercu.html**. Ce fichier contient le code et les données de démonstration : il fonctionne seul, hors ligne, dans un navigateur moderne. Aucun paquet à installer, aucune police distante, aucune requête réseau.

- Glisser la maquette pour tourner et modifier l’inclinaison. Molette ou boutons + / − pour zoomer.
- Choisir une aile et un niveau pour voir ses appartements. La recherche utilise le numéro, par exemple A-301.
- « Du dessus » isole le niveau sélectionné, ou R+4 si tous les niveaux étaient affichés. Choisir ensuite un autre niveau dans le filtre.
- « Vue éclatée » écarte verticalement les niveaux affichés. Réinitialiser remet tous les filtres et la caméra à leur état initial.
- Cliquer un appartement pour afficher sa fiche. La liste offre la même sélection au clavier et sur mobile.
- Clavier sur la maquette : flèches pour orienter, + / − pour zoomer, Échap pour désélectionner, Home pour rétablir la caméra.

## Contenu

| Fichier | Usage |
| --- | --- |
| GARUDA-U-apercu.html | Démonstration autonome complète |
| garuda-u-plan.mjs | Module de géométrie, rendu et sélection |
| garuda-u-units.csv | Les 150 unités fictives, avec identifiants identiques au module |
| garuda-u-demo-data.mjs | États commerciaux et paiements fictifs de l’aperçu seulement |
| LIRE-MOI.md | Notice et proposition d’interface |

## Hypothèses du dessin

Trois ailes (A Nord, B Ouest, C Est), cinq niveaux **RDC + R+1 à R+4**, dix appartements par aile et par niveau. Total : 150 unités. Numérotation A-101 à A-110 au RDC, A-201 à A-210 au R+1, etc. Le premier chiffre est le rang du niveau, et ne remplace pas le champ `floor`.

L’emprise des ailes forme un U d’environ 60 × 60 m, avec une hauteur d’étage de 3,30 m. Le site schématique mesure 74 × 77 m. Cour, piscine, arbres et cheminements ne sont pas des unités vendables.

Les unités A sont des volumes de 5,7 × 8,1 m (46,2 m² arrondis), avec terrasse de 5,7 m². Les unités B et C sont des volumes de 8,1 × 4,7 m (38,1 m² arrondis), avec terrasse de 4,7 m². Couloirs communs sur cour. Les surfaces sont celles des volumes conceptuels, sans déduction constructive. Les distributions intérieures, escaliers, ascenseurs et études réglementaires ne sont pas modélisés.

Rendu géométrique simplifié en projection orthographique 3D sur Canvas 2D, palette douce inspirée de l’aquarelle. Aucune dépendance. Les dalles ont 55 % de transparence ; les volumes colorés sont plus opaques pour rester lisibles. Le tri des faces est adapté à cette maquette, sans moteur CAD/BIM ni moteur WebGL généraliste.

## Couleurs et informations

Vert sauge : disponible. Jaune : option. Orange : réservation confirmée. Lavande : vendu mais non entièrement payé. Corail : entièrement payé. Gris : indisponible ou inconnu, avec des libellés distincts.

Le corail est prioritaire lorsque `payment_status` vaut `paid`. La fiche conserve toujours **deux champs distincts** pour le statut commercial et le paiement. Un paiement manquant reste « Non renseigné ». Aucun prix n’a été inventé. Les états de démonstration ne doivent pas être importés comme données opérationnelles.

## CSV proposé, à confirmer avec Lovable

Ce paquet ne prétend pas respecter un contrat définitif du CRM : celui-ci doit être fourni ou confirmé par le lot 1 de Lovable. Le schéma ci-dessous constitue la proposition `garuda-plan/0.1`.

UTF-8 sans BOM, séparateur virgule, fins de ligne CRLF, point décimal, une ligne d’en-tête puis 150 lignes. Guillemets CSV standards pour les cellules qui en ont besoin. Les colonnes sont :

| Champ | Type / sens |
| --- | --- |
| schema_version | `garuda-plan/0.1` |
| is_demo | `true` pour toutes les lignes |
| unit_id | UUID v5 fictif stable ; clé de liaison avec le dessin |
| number | Libellé, par exemple A-301 |
| building | A, B ou C ; représente ici une aile |
| floor | Entier 0 à 4 ; 0 = RDC |
| type | Studio ou T2 · 1 chambre |
| interior_m2 | Nombre décimal, m² conceptuels arrondis au dixième |
| terrace_m2 | Nombre décimal, m² |
| price | Vide : non renseigné |
| currency | Vide : non renseignée |
| presale_eligible | Vide : aucune éligibilité inventée |

Les UUID sont dérivés de `garuda-u-demo/<number>` dans l’espace de noms UUID DNS standard. Ils sont propres à cette démonstration. Pour un projet existant, reprendre les identifiants du CRM et remplacer les correspondances dans les deux fichiers avant intégration. Ne pas réattribuer un UUID d’une unité existante en fonction de son nouveau libellé.

Le projet est déterminé par la fiche ouverte côté CRM, pas par le CSV. Une cellule vide n’ordonne aucun effacement. Le fichier ne contient aucun statut financier ou commercial et ne confirme aucune opération.

## Interface du module proposée

Exports nommés : `manifest`, `units`, `palette`, `statusLabels`, `statusKey(record)` et `mount(container, options)`.

```js
import { mount } from './garuda-u-plan.mjs';

// À exécuter dans le document isolé préparé par Lovable.
// Le conteneur doit avoir une largeur et une hauteur explicites.
const viewer = mount(document.getElementById('plan'), {
  data: authorizedRecords,
  onSelect(event) {
    // event = {schema: 'garuda-plan/0.1', type: 'unit-selected', unit_id}
    // null = désélection. Le pont de l’hôte reçoit cette information.
    if (event) handleSelection(event.unit_id);
  },
  onHover(unitId) { /* UUID ou null ; facultatif */ }
});

viewer.update(nextAuthorizedRecords); // Remplacement complet, pas fusion.
viewer.setView({ wing: 'B', floor: 2, view: '3d', exploded: false });
viewer.select(knownUnitId);           // ou null pour désélectionner
viewer.getVisibleUnits();            // Géométries correspondant aux filtres
viewer.getState();                   // Copie de l’état de la vue
viewer.reset();                      // Caméra uniquement, filtres conservés
viewer.destroy();                    // Observateur, événements, frame et canvas libérés
```

Chaque donnée autorisée a la forme suivante :

```js
{
  unit_id: 'UUID présent dans le module',
  commercial_status: 'available', // option, reserved, sold, unavailable, unknown
  payment_status: 'unknown'       // unpaid, partial, paid, unknown
}
```

`update()` rejette les doublons et les identifiants absents du dessin avant de remplacer les données. Un identifiant omis dans une nouvelle liste devient inconnu. `mount()` sans `data` affiche toutes les unités comme inconnues. `onSelect` émet seulement un identifiant : le module ne fait aucun appel réseau, aucune réservation, aucune écriture en base, aucun envoi de document. L’hôte reste responsable de l’autorisation des données et de la validation finale de toute sélection.

`setView` accepte `view` (`3d` ou `top`), `wing` (`all`, A, B, C), `floor` (`all`, 0–4), `status` (`all` ou une clé de la palette), `query` (recherche sur le numéro), `exploded` (booléen), `zoom` (0,65–2,4) et `structureOpacity` (0,15–0,8 ; opacité, et non transparence). Une sélection cachée par un nouveau filtre est annulée.

L’application d’aperçu inclut sa propre interface et une copie intégrée du module pour fonctionner par double-clic. Modifier le `.mjs` seul ne modifie pas cette copie HTML. Pour l’intégration, charger le `.mjs` et construire les contrôles côté visualiseur isolé.

## À raccorder dans Lovable

Confirmer les noms de champs CSV, les valeurs de statut et le cycle de vie ci-dessus. Exécuter le module dans l’environnement isolé prévu par le CRM, sans session ni clés privées. Le paquet ne construit pas cet environnement ni le protocole interfenêtres de Lovable. Le pont devra valider la source, le canal, le format et les identifiants des messages ; limiter les ressources autorisées. Conserver une liste accessible si le rendu n’est pas disponible.

L’import et l’activation doivent conserver l’étape d’aperçu et de contrôle des correspondances. Revenir à une version antérieure du dessin ne doit jamais restaurer des états de paiement ou de réservation.

