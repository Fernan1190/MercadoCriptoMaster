import { useGame } from '../context/GameContext';

export function TestGameState() {
  const { stats, actions } = useGame();

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff', borderRadius: '8px', margin: '20px' }}>
      <h2>🎮 Game State Test</h2>
      
      <div style={{ marginBottom: '10px', fontSize: '16px' }}>
        <p>💰 Balance: ${stats.balance.toFixed(2)}</p>
        <p>📊 XP: {stats.xp}</p>
        <p>🎖️ Level: {stats.level}</p>
        <p>🏆 League: {stats.league}</p>
        <p>⭐ Streak: {stats.streak}</p>
        <p>🔧 Skill Points: {stats.skillPoints}</p>
      </div>

      <button
        onClick={() => actions.updateStats(50)}
        style={{
          padding: '10px 20px',
          marginRight: '10px',
          background: '#0f7',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        +50 XP
      </button>

      <button
        onClick={() => actions.buyAsset('BTC', 0.1, 45000)}
        style={{
          padding: '10px 20px',
          background: '#07f',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        Buy 0.1 BTC
      </button>
    </div>
  );
}
