# NOMAD GAME — Base de conception

## Règle centrale
**Le monde est libre, mais chaque choix a des conséquences.**

## Création du joueur : avatar + humanoïde
Avant même de commencer sa partie, chaque joueur crée son identité dans NOMAD :
1. **Créer son avatar** : nom/pseudonyme et apparence de base, avec possibilité d'évolution vers une personnalisation beaucoup plus riche.
2. **Créer son propre humanoïde** : nom, apparence et rôle/capacités de départ. L'humanoïde accompagne le joueur et constitue un membre de son équipe.
3. **Choisir son monde de départ** : Terre, Mer/Océan, Espace, Lune ou Mars.
4. **Créer sa plateforme personnelle**.
5. **Se connecter progressivement au réseau NOMAD**, ou rester plus indépendant.

Séquence fondatrice : **NOMAD existe déjà → création de l'avatar → création de l'humanoïde → choix du monde → plateforme personnelle → connexion au réseau.**

## Mondes initiaux
- **🌍 Terre** : ville NOMAD existante, campagne, montagne, forêt, désert, zones glacées et volcaniques.
- **🌊 Mer / Océan** : village flottant existant, côte, haute mer, plateformes et zones sous-marines.
- **🛰️ Espace** : ville orbitale déjà habitée, habitats, serres, docks, robotique et transports orbitaux.
- **🌙 Lune** : base lunaire déjà installée, habitats protégés, énergie, ressources et ateliers.
- **🔴 Mars** : ville martienne déjà habitée, serres, ressources, fabrication et robotique.

Réseau : **TERRE ↔ MER/OCÉAN ↔ ORBITE ↔ LUNE ↔ MARS**.

## Mobilité — fondation du prototype
Le jeu doit proposer un véritable écosystème de déplacement, adapté à chaque environnement.

### Terre
Voiture classique, voiture électrique, moto, vélo, trottinette, skate, hoverboard, bus, tram, métro, train, avion et **voiture autonome expérimentale**.

### Mer / Océan
Vélo et mobilités de plateforme, skate/hoverboard selon les zones, planche de surf, voilier, bateau, bateau électrique et prototypes nautiques autonomes.

### Espace
Déplacements à pied dans les installations, navettes orbitales, transports autonomes expérimentaux et train orbital.

### Lune et Mars
Déplacements à pied avec équipement, rovers, navettes et rovers autonomes expérimentaux.

Les transports sont une partie du gameplay : ils permettent de se déplacer, d'accéder aux différents espaces et, à terme, pourront être achetés, loués, fabriqués, réparés, améliorés, revendus ou recyclés.

## Économie NOMAD — fondation dès le prototype
- **1 000 000 NOMAD** de capital de départ pour le prototype.
- Une monnaie interne sert aux achats, constructions, activités, production, échanges et services.
- Le portefeuille distingue **banque** et **espèces/billets**.
- Les retraits/dépôts sont fictifs dans le prototype.
- Les transactions sont conservées dans la sauvegarde locale.
- La monnaie est explicitement **fictive et sans valeur réelle** dans cette version.

Toute éventuelle connexion future à des achats ou à de l'argent réel reste séparée du moteur économique du prototype.

## Principe fondamental : NOMAD existe déjà
Le joueur ne commence jamais dans un monde vide. Chaque grand environnement possède déjà une ville/implantation NOMAD vivante, habitée et fonctionnelle. Le joueur construit sa propre histoire et sa plateforme à l'intérieur de cet univers.

## Plateforme personnelle
Elle peut être une habitation, un atelier, une ferme/serre, un espace de recherche, un commerce, une base robotique, un ensemble de modules ou une combinaison libre. Elle peut rester autonome ou se greffer progressivement au réseau NOMAD.

## Humanoïde du joueur
Le premier humanoïde est créé avant l'entrée dans le monde. Il accompagne le joueur, participe aux activités et pourra évoluer. À terme, plusieurs humanoïdes pourront former un groupe.

## Boucle de jeu
Choisir → rejoindre NOMAD → construire sa plateforme → se déplacer → produire/explorer/échanger → connecter → subir les événements → réparer/reconstruire → évoluer.

## Conséquences et événements
Crues, tempêtes, pannes, micrométéorites, poussière lunaire, tempêtes martiennes et autres catastrophes peuvent modifier le monde et les installations.

## Commerce
Les matériaux récupérés et certains meubles pourront être revendus dans un marché interne au jeu pour financer de nouvelles constructions.

## Petite voix
Elle observe et prévient sans décider à la place du joueur. Son humour réagit aux conséquences des choix.

## Séparation réel / jeu
Les éléments inspirés des concepts NOMADCELL01 réels sont adaptés comme éléments fictifs de simulation. Ils ne remplacent pas les visuels ni les documents du projet réel.

## Objectif de cette version
Le prototype doit être **jouable et testable dès maintenant**, avec les cinq environnements, la création avatar/humanoïde, la plateforme personnelle, l'économie fictive, les événements et la première couche de mobilité. Les versions suivantes enrichiront progressivement les mondes, véhicules, bâtiments, métiers, ressources et interactions sans casser les fondations.