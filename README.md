# Vocactive
Webapp for educators for increased student engagement. Created using React and MaterialUI
![Demo](https://raw.githubusercontent.com/AndrasGardos/Vocactive/master/demo.gif)

It's very important that educators keep all students engaged during the class. This app can manage groups of students, and help the teacher call them in random order - making sure that everyone can participate in the class. 

Usable on smartphones, tablets, laptops, smartboards. The data of the groups are saved locally, they never leave the device.

Offline (PWA) capabilities coming soon :)

## Drawing modes
When starting a session you can choose how names are drawn:
- **Teljesen véletlenszerű (totally random)** – every draw is independent, so the same student may come up several times in a row.
- **Egy pakli (one deck)** – every student is drawn exactly once before the deck is reshuffled.
- **Dupla pakli (double deck)** – as if each student's name were on two cards: everyone is drawn exactly twice before the deck is reshuffled, but never twice in a row.

## Development
Built with React, MUI and Vite. Requires Node.js 22.22 or newer.

```sh
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run lint     # run ESLint
```

## Contribution
You are welcome to open issues or even pull requests. I'm looking forward to getting feedback from educators.


## Try it
[https://vocactive.netlify.com](https://vocactive.netlify.com)
