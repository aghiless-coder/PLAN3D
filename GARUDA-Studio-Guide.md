# GARUDA Studio — Configurateur de projets

Version locale 1 · Ambiance aquarelle tropicale · 18 septembre 2026

Ouvrir **GARUDA-Studio.html** dans un navigateur moderne. Le fichier contient tout le configurateur. Aucun compte, aucune installation et aucune connexion au CRM ne sont nécessaires. Le dossier `garuda-studio-source` contient le code modifiable.

## 1. Dessiner le terrain

Cliquer **Nouveau** pour commencer un autre projet. Le remplacement d’un projet ouvert demande confirmation et reste annulable pendant la session.

Choisir **Terrain** et placer ses sommets dans l’ordre, puis cliquer le premier sommet ou **Fermer le contour**. Entrée ferme également le tracé. Les formes concaves sont acceptées ; un contour qui se croise est refusé.

On peut aussi créer un premier terrain rectangulaire en indiquant sa largeur et sa longueur dans le panneau de droite. Toutes les dimensions sont en mètres.

Avec **Sélection**, déplacer un sommet ou le contour complet. Le panneau de droite permet de saisir la position, les dimensions, une rotation et les coordonnées exactes de chaque sommet. Les dimensions redimensionnent tout le contour autour de son origine, en conservant sa forme générale. Sélectionner une poignée, puis ajouter ou retirer un sommet. Une modification qui ferait sortir un espace existant du terrain est refusée.

La case **Grille** active l’alignement sur un pas de 0,1 à 5 m. La décocher permet des positions au centimètre. Maintenir Maj pendant le tracé d’un polygone contraint le segment à l’horizontale ou à la verticale. Molette : zoom. **Déplacer vue** : déplacement de la vue. **Tout cadrer** : retour au terrain complet.

## 2. Dessiner et qualifier les espaces

Choisir le type, puis **Polygone** pour un contour libre ou **Rectangle** pour dessiner en glissant. Chaque forme contient de 3 à 80 sommets et un seul contour.

| Type | Position initiale | Compte comme unité |
| --- | --- | --- |
| Appartement / unité | Étage actif, ou RDC si le terrain est actif | Oui |
| Terrain pour villa | Terrain partagé | Oui |
| Jardin | Terrain partagé | Non |
| Piscine | Terrain partagé | Non |
| Route / accès | Terrain partagé | Non |
| Terrasse | Terrain partagé | Non |
| Espace commun | Étage actif | Non |
| Espace libre | Étage actif | Non, activable dans les propriétés |

Le niveau de chaque espace peut ensuite être changé dans ses propriétés : un jardin peut ainsi être placé sur un toit-terrasse. Les éléments au niveau **Terrain · partagé** restent visibles avec tous les niveaux et ne sont pas dupliqués avec un étage.

Un terrain pour villa représente ici **une parcelle vendable**, pas une villa détaillée. Sa hauteur peut être augmentée pour représenter un volume. Le regroupement de plusieurs espaces répartis sur plusieurs niveaux en une seule unité commerciale n’est pas encore proposé par cette version.

Les espaces peuvent se superposer, par exemple une piscine dans un jardin. Il n’y a pas de contrôle architectural automatique des collisions entre unités. Les surfaces affichées sont des surfaces de contours ; elles ne constituent pas des surfaces habitables certifiées. Leur somme peut compter des superpositions.

## 3. Nommer les unités avec un alias

Saisir l’alias avant de dessiner : **A**, **LOT**, **VILLA**, etc. Il s’applique aux nouvelles formes et ne renomme pas les unités existantes.

- Avec `LOT`, les premières unités du RDC sont `LOT-101`, `LOT-102`…
- Au niveau suivant : `LOT-201`, `LOT-202`…
- Sur le terrain partagé, avec `VILLA` : `VILLA-001`, `VILLA-002`…

Le chiffre de niveau est son rang dans la liste ; le RDC est le premier. La séquence est attribuée par alias et par niveau, y compris pour les espaces non vendables utilisant le même alias. Utiliser un alias distinct, comme `SITE`, pour ces espaces si l’on souhaite garder une séquence propre aux logements.

La fiche de chaque espace permet de modifier son alias, sa séquence ou son libellé personnalisé. Un libellé personnalisé remplace l’affichage automatique. Les libellés dupliqués entre unités sont refusés.

Chaque unité possède aussi un UUID technique : déplacer, redimensionner ou renommer une unité conserve cet UUID. Dupliquer une unité ou un étage produit de nouveaux UUID. Supprimer un étage peut changer les numéros automatiques des étages qui suivent, sans changer leurs UUID. Les objets vendables désactivés gardent leur UUID en réserve mais ne figurent plus dans l’export des unités.

## 4. Dupliquer puis modifier les étages

Choisir le niveau source, puis **Dupliquer cet étage**. Le nouveau niveau est ajouté au-dessus de la liste, avec sa propre copie des formes. Les jardins et routes du terrain partagé ne sont pas copiés.

Modifier ensuite ses contours, dimensions, noms et usages : les autres niveaux restent inchangés. Les libellés personnalisés ne sont pas copiés afin de permettre la nouvelle numérotation automatique.

**+ Étage vide** crée un niveau sans formes. La hauteur d’étage définit l’altitude des niveaux supérieurs. La hauteur propre d’un volume se règle séparément. Le bouton **Étage actif** limite l’aperçu 3D au niveau choisi et au terrain partagé. **Éclaté** sépare les niveaux visuellement sans modifier leurs coordonnées enregistrées.

## 5. Couleurs, aquarelle et paysage

Cliquer **Couleurs & décor**, ou l’onglet **Ambiance** dans le panneau de droite. Les palettes **Lagon**, **Sable** et **Corail** changent les couleurs des unités, des parcelles pour villa et des piscines. Chaque type possède aussi son propre sélecteur de couleur. Pour saisir une couleur exacte, ouvrir **Codes couleur précis**, renseigner un code `#RRGGBB`, puis cliquer **Appliquer les codes couleur**.

Pour personnaliser un seul espace, le sélectionner puis régler **Couleur de ce bloc** dans l’onglet **Espace**. **Reprendre la couleur du type** supprime cette personnalisation. Les copies d’un espace ou d’un étage conservent les couleurs choisies.

Le curseur **Transparence des blocs** varie de 15 à 85 %. Les volumes 3D utilisent des lavis translucides, des contours légers et un grain de papier. Les espaces au sol gardent des teintes douces pour rester lisibles.

**Afficher les points cardinaux** montre N, E, S et O en 2D et en 3D. L’angle du nord se mesure dans le sens horaire depuis le haut du plan : 0° vers le haut, 90° vers la droite. La boussole 3D suit la rotation de la caméra.

Activer **Décor tropical et palmiers** et **Afficher la mer** selon l’ambiance souhaitée. Choisir le côté géographique de la mer et le recul du rivage, puis **Vue vers la mer** pour orienter la caméra. Les couleurs de la mer, du sable, du terrain et de la végétation sont personnalisables.

Le décor est indicatif : les palmiers et le rivage ne deviennent pas des espaces du projet et ne changent pas les contours, surfaces ou identifiants. Il ne garantit pas la vue réelle depuis chaque logement. Tous ces réglages sont enregistrés dans le projet et inclus dans les exports 3D.

## 6. Annuler, enregistrer et reprendre

Les modifications géométriques peuvent être annulées et rétablies, avec les boutons ou Ctrl/⌘+Z et Ctrl/⌘+Maj+Z. L’historique conserve les 60 dernières modifications pendant la session ; il n’est pas conservé après rechargement. Le nom du projet et l’alias de dessin sont enregistrés directement.

Le projet courant est sauvegardé automatiquement dans le navigateur si celui-ci autorise le stockage local. Un changement de navigateur, d’adresse, de profil ou un nettoyage des données peut rendre cette sauvegarde inaccessible.

Utiliser **Enregistrer** pour télécharger un fichier `.garuda.json`. C’est le format éditable complet : terrain, niveaux, formes, types, alias, identifiants, couleurs et ambiance. **Ouvrir un projet** recharge ce fichier. Les anciens projets restent compatibles et reçoivent l’ambiance par défaut. Ne pas utiliser le CSV pour sauvegarder le dessin : il contient seulement la liste des unités.

Les imports sont contrôlés avant remplacement : schéma, identifiants, doublons, coordonnées, contours et confinement au terrain. Limites de cette version : 30 niveaux, 2 000 espaces, 80 sommets par forme et fichier JSON de 5 Mo maximum. Les coordonnées sont limitées à ±10 000 m.

## 7. Exporter pour GARUDA

Le menu **Exporter** prépare trois fichiers indépendants, correspondant au projet au moment du clic :

- **Module 3D `.mjs`** : géométrie, unités et visualiseur autonome.
- **Unités `.csv`** : uniquement les espaces marqués vendables, avec leurs UUID et numéros.
- **Aperçu `.html`** : visualisation autonome partageable, avec sélection des unités et liste accessible.

Les prix, les statuts commerciaux, les réservations et les paiements ne sont pas inventés. L’aperçu HTML conserve la palette aquarelle et indique les statuts comme inconnus. Ces couleurs décoratives ne représentent pas des disponibilités commerciales. Dans le module destiné au CRM, les couleurs des unités suivent les données commerciales fournies par l’hôte, avec du gris pour un statut inconnu ; le paysage et la transparence restent ceux du projet.

### Proposition d’interface — `garuda-plan/0.2`

Cette interface doit être confirmée avec Lovable avant une intégration réelle. Elle étend la proposition 0.1 de la démonstration en U pour prendre en charge des géométries libres.

```js
import { manifest, units, mount } from './mon-projet-plan.mjs';

const viewer = mount(containerAvecDimensions, {
  data: authorizedRecords,
  onSelect(event) {
    // {schema:'garuda-plan/0.2',type:'unit-selected',unit_id} ou null.
    // L’hôte valide l’UUID et ouvre la fiche autorisée.
  }
});

viewer.update(nextAuthorizedRecords); // Remplacement complet.
viewer.setView({ level: 'all', exploded: true });
viewer.zoomBy(1.2);
viewer.reset();
viewer.lookAtSea(); // Oriente la caméra vers le côté choisi pour la mer.
viewer.destroy();
```

`units` expose `unit_id`, `number`, `alias`, `level_id`, `floor`, `level`, `type`, `area_m2`, `height_m` et `space_id`. `floor` est indexé à partir de zéro, ou `null` pour un objet du terrain partagé. Utiliser `level_id` dans `setView({level})` pour un niveau précis ; `site` affiche seulement les espaces du terrain.

Les données fournies au module sont des objets `{unit_id, commercial_status, payment_status}`. Statuts commerciaux : `available`, `option`, `reserved`, `sold`, `unavailable`, `unknown`. Paiements : `unpaid`, `partial`, `paid`, `unknown`. Le paiement intégral impose le corail, les autres couleurs suivent le statut commercial. Une unité absente d’un nouvel ensemble de données devient inconnue. Les UUID inconnus ou dupliqués sont refusés avant remplacement des données.

Le CSV utilise UTF-8 avec BOM, une virgule comme séparateur, un point décimal, des fins de lignes CRLF et les colonnes : `schema_version,unit_id,number,alias,floor,level,type,area_m2,height_m,price,currency`. Les prix et devises restent vides. Le projet importé doit être imposé par la fiche ouverte côté CRM, et les cellules vides ne doivent pas effacer implicitement les valeurs existantes.

Le module ne gère ni session, ni réservation, ni paiement. Il ne contacte aucun serveur. Lovable doit fournir l’environnement isolé, le contrôle des données autorisées, la validation des messages de sélection et l’import des unités. L’éditeur ne modifie aucun dépôt, aucune base et aucun état du CRM.

## Fichiers sources

`studio-core.mjs` porte le modèle et les règles géométriques ; `studio-renderer.mjs` le rendu Canvas en projection 3D ; `studio-app.js` l’interface et les interactions ; `studio.html` le gabarit et les styles. Les polygones de toiture sont triangulés pour le rendu des formes concaves. Le moteur reste une visualisation de volumes, sans CAD/BIM, structure constructive ni matériaux photoréalistes.

Pour reconstruire l’HTML avec Node.js, depuis le dossier des sources :

```sh
node build-studio.mjs ./GARUDA-Studio.html
```

Aucune dépendance à installer. L’import de modèles SketchUp, les découpes automatiques, les trous dans les polygones et les regroupements multi-niveaux ne sont pas inclus dans cette première version.

