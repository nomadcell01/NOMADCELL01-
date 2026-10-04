#!/usr/bin/env python3
"""Point d'entrée téléphone pour T.H.E.O. Avel."""

from theo.core import Theo


def main() -> None:
    theo = Theo()
    print("T.H.E.O. Avel — téléphone — V0.1")
    print("Tape /help pour les commandes. /quit pour sortir.")
    while True:
        try:
            text = input("T.H.E.O. > ")
        except (EOFError, KeyboardInterrupt):
            print("\nArrêt de T.H.E.O.")
            break
        keep_running, response = theo.handle(text)
        if response:
            print(response)
        if not keep_running:
            break


if __name__ == "__main__":
    main()
