import { Component } from 'react'

// Évite l'écran blanc : si une page plante au rendu, on affiche un message
// et un bouton pour recharger plutôt qu'une app figée.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Erreur de rendu :', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page" style={{ paddingTop: 60, textAlign: 'center' }}>
          <span className="eyebrow">Oups</span>
          <h1 style={{ fontSize: 22, marginTop: 6 }}>Quelque chose a planté</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-faint)', margin: '10px 0 20px' }}>
            La page n'a pas pu s'afficher. Recharge l'application pour réessayer.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.assign('/')}>
            Recharger
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
