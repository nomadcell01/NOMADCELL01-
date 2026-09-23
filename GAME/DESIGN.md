# NOMAD GAME — Base de conception

## Règle centrale
**Le monde est libre, mais chaque choix a des conséquences.**

## Création du joueur : avatar + humanoïde
Avant même de commencer sa partie, chaque joueur crée son identité dans NOMAD :
1. **Créer son avatar** : nom/pseudonyme et apparence de base, avec possibilité d'évolution vers une personnalisation beaucoup plus riche.
2. **Créer son propre humanoïde** : nom, apparence et rôle/capacités de départ. L'humanoïde accompagne le joueur et constitue un membre de son équipe.
3. **Choisir son monde de départ** : Terre, Mer, Espace, Lune ou Mars.
4. **Créer sa plateforme personnelle**.
5. **Se connecter progressivement au réseau NOMAD**, ou rester plus indépendant.

Séquence fondatrice : **NOMAD existe déjà → création de l'avatar → création de l'humanoïde → choix du monde → plateforme personnelle → connexion au réseau.**

## Économie NOMAD — fondation dès le prototype
L'économie est prévue dès le départ dans l'architecture du jeu afin de ne pas devoir reconstruire tout le système plus tard.

- **1 000 000 NOMAD** de capital de départ pour le prototype.
- Une même monnaie interne sert aux achats, constructions, activités, production, échanges et services.
- Le portefeuille distingue **banque** et **espèces/billets**.
- Les billets sont une représentation physique de la monnaie du jeu : retraits et dépôts sont déjà prévus comme opérations fictives.
- Les gains et dépenses sont enregistrés dans un historique de transactions.
- La monnaie est persistée dans la sauvegarde locale avec le reste de la partie.
- Dans le prototype actuel, cette monnaie est explicitement **fictive et sans valeur réelle**.

### Évolution prévue
La possibilité d'un lien ultérieur avec une plateforme d'achat et de l'argent réel est volontairement séparée du moteur économique du jeu. Elle pourra être étudiée plus tard sans modifier les fondations de l'économie interne.

## Principe fondamental : NOMAD existe déjà
Le joueur ne commence jamais dans un monde vide. Chaque grand environnement possède déjà une ville/implantation NOMAD vivante, habitée et fonctionnelle. Le joueur construit sa propre histoire et sa plateforme à l'intérieur de cet univers.

## Plateforme personnelle
Elle peut être une habitation, un atelier, une ferme/serre, un espace de recherche, un commerce, une base robotique, un ensemble de modules ou une combinaison libre. Elle peut rester autonome ou se greffer progressivement au réseau NOMAD.

## Mondes initiaux
- **🌍 Terre** : ville NOMAD existante, puis campagne, montagne, forêt, désert, zones glacées et volcaniques.
- **🌊 Mer** : village flottant existant, côte, haute mer, plateformes et zones sous-marines.
- **🛰️ Espace** : ville orbitale déjà habitée, habitats, serres, docks et robotique.
- **🌙 Lune** : base lunaire déjà installée, habitats protégés, énergie, ressources et ateliers.
- **🔴 Mars** : ville martienne déjà habitée, serres, ressources, fabrication et robotique.

Réseau : **TERRE ↔ MER ↔ ORBITE ↔ LUNE ↔ MARS**.

## Humanoïde du joueur
Le premier humanoïde est créé avant l'entrée dans le monde. Il n'est pas un simple élément cosmétique : il accompagne le joueur, peut participer aux activités et pourra évoluer avec le jeu. À terme, le joueur pourra créer plusieurs humanoïdes et constituer son propre groupe.

## Boucle de jeu
Choisir → rejoindre NOMAD → construire sa plateforme → produire/explorer/échanger → connecter → subir les événements → réparer/reconstruire → évoluer.

## Conséquences et événements
Crues, tempêtes, pannes, micrométéorites, poussière lunaire, tempêtes martiennes et autres catastrophes peuvent modifier le monde et les installations.

## Commerce
Les matériaux récupérés et certains meubles peuvent être revendus dans un marché interne au jeu pour financer de nouvelles constructions.

## Petite voix
Elle observe et prévient sans décider à la place du joueur. Son humour réagit aux conséquences des choix.

## Séparation réel / jeu
Les éléments inspirés des concepts NOMADCELL01 réels sont adaptés comme éléments fictifs de simulation. Ils ne remplacent pas les visuels ni les documents du projet réel.
