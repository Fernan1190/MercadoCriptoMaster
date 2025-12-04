import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Briefcase, MapPin, TrendingUp, Shield, Loader, Palette, Gamepad2, Zap, Server, PlusCircle, BatteryCharging, Bitcoin, Wrench } from 'lucide-react';
import OfficeScene from './OfficeScene'; 
import { RACKS, MINERS } from '../data/items';

export const Office: React.FC = () => {
  const navigate = useNavigate();
  const { stats, actions, market } = useGame();
  const { level, officeItems, balance, activeBuffs, activeSkin, miningFarm, league, unlockedAchievements } = stats;
  const { changeOfficeSkin, buyRack, buyMiner, sellMinedCrypto, repairMiner } = actions;

  const [showDecorator, setShowDecorator] = useState(false);
  const [showArcade, setShowArcade] = useState(false);
  const [showMining, setShowMining] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  let tierName = "Sótano Familiar";
  if (level >= 5) tierName = "Garaje Start-up";
  if (level >= 10) tierName = "Oficina Privada";
  if (level >= 20) tierName = "Penthouse Wall St.";
  if (level >= 50) tierName = "Base Lunar";

  const minedValue = miningFarm.minedFragments * (market.prices['BTC'] || 0);

  return (
    <div className="w-full h-full flex flex-col bg-black animate-fade-in relative overflow-hidden">
      
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl flex items-center gap-4 shadow-2xl pointer-events-auto">
              <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400"><Briefcase size={24} /></div>
              <div><h1 className="text-xl font-black text-white tracking-tight uppercase">{tierName}</h1><p className="text-xs text-slate-400 font-mono">NIVEL {level}</p></div>
          </div>
          {activeBuffs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 pointer-events-auto">
                  {activeBuffs.map(buff => (
                      <div key={buff.id} className="bg-yellow-900/80 border border-yellow-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] text-yellow-400 font-bold animate-pulse shadow-lg"><Zap size={12} fill="currentColor"/> {buff.id}</div>
                  ))}
              </div>
          )}
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 pointer-events-auto">
         <button onClick={() => setShowMining(true)} className="bg-orange-600/90 hover:bg-orange-500 text-white px-6 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2 font-black text-xs tracking-widest transition-all hover:scale-105"><Server size={18}/> MINERÍA</button>
         <button onClick={() => setShowArcade(true)} className="bg-purple-600/90 hover:bg-purple-500 text-white px-6 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2 font-black text-xs tracking-widest transition-all hover:scale-105"><Gamepad2 size={18}/> ARCADE</button>
      </div>

      <div className="absolute top-6 right-6 z-20 bg-green-900/80 backdrop-blur-xl border border-green-500/30 p-4 rounded-2xl shadow-2xl pointer-events-none">
          <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">Valor Neto</div>
          <div className="text-2xl font-mono font-black text-white tracking-tighter">${balance.toLocaleString()}</div>
      </div>

      <div className="absolute inset-0 z-0 bg-slate-950">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-500 gap-2"><Loader className="animate-spin"/> Cargando...</div>}>
             <OfficeScene level={level} items={officeItems || []} league={league} skin={activeSkin || { floor: '#1e293b', wall: '#334155' }} achievements={unlockedAchievements || []} miningFarm={miningFarm} />
          </Suspense>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]"></div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-3xl shadow-2xl flex items-center justify-between z-30">
          <div className="flex gap-6 md:gap-10 px-2">
              <div className="flex items-center gap-3"><div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><MapPin size={20}/></div><div className="hidden md:block"><div className="text-[10px] text-slate-500 font-bold uppercase">Ubicación</div><div className="text-sm font-bold text-white">{level < 50 ? 'Tierra' : 'Estación Espacial'}</div></div></div>
              <button onClick={() => setShowDecorator(!showDecorator)} className={`flex items-center gap-3 group px-3 py-1 rounded-xl transition-colors ${showDecorator ? 'bg-purple-500/20 ring-1 ring-purple-500' : 'hover:bg-slate-800'}`}><div className="text-purple-400"><Palette size={20}/></div><div className="text-left"><div className="text-[10px] text-slate-500 font-bold uppercase group-hover:text-purple-300">Estilo</div><div className="text-sm font-bold text-white">Decorar</div></div></button>
          </div>
          <button onClick={() => navigate('/shop')} className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95"><TrendingUp size={18}/> <span className="hidden md:inline">Tienda</span></button>
      </div>

      {showMining && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col p-6 md:p-12 animate-fade-in overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                  <div><h2 className="text-3xl font-black text-white flex items-center gap-3"><Server className="text-orange-500"/> Granja de Minería</h2><p className="text-slate-400 text-sm">Gestiona tu hardware para generar ingresos pasivos.</p></div>
                  <button onClick={() => setShowMining(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
                  <div className="space-y-6">
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Rendimiento Actual</h3>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div><div className="text-2xl font-mono text-white font-bold">{miningFarm.totalHashrate} <span className="text-sm text-slate-500">TH/s</span></div><div className="text-xs text-slate-400">Hashrate Total</div></div>
                              <div><div className="text-2xl font-mono text-red-400 font-bold">{miningFarm.totalPowerConsumption} <span className="text-sm text-slate-500">W</span></div><div className="text-xs text-slate-400">Consumo</div></div>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                              <div className="flex justify-between items-center mb-2"><span className="text-slate-400 text-xs">Minado (BTC Dust)</span><span className="text-orange-400 font-mono">{miningFarm.minedFragments.toFixed(8)}</span></div>
                              <div className="flex justify-between items-center mb-4"><span className="text-slate-400 text-xs">Valor Estimado</span><span className="text-white font-bold font-mono">${minedValue.toFixed(2)}</span></div>
                              <button onClick={sellMinedCrypto} disabled={minedValue < 1} className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"><Bitcoin size={18}/> VENDER CRYPTO</button>
                          </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-1 overflow-y-auto max-h-[300px]">
                          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Comprar Estructuras</h3>
                          <div className="space-y-3">{RACKS.map(rack => (<div key={rack.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800"><div><div className="font-bold text-white text-sm">{rack.name}</div><div className="text-xs text-slate-500">{rack.slots} slots • x{rack.efficiency} enfriamiento</div></div><button onClick={() => buyRack(rack.id)} className="bg-slate-800 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors border border-slate-700">${rack.price}</button></div>))}</div>
                      </div>
                  </div>
                  <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 overflow-y-auto custom-scrollbar">
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Tus Instalaciones</h3>
                      {miningFarm.racks.length === 0 ? (<div className="text-center py-20 text-slate-500"><Server size={48} className="mx-auto mb-4 opacity-20"/><p>No tienes racks instalados.</p><p className="text-xs">Compra uno en el panel izquierdo para empezar.</p></div>) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {miningFarm.racks.map((rack, i) => (
                                  <div key={rack.instanceId} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative group">
                                      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2"><span className="font-bold text-white text-sm">Rack #{i+1} ({RACKS.find(r => r.id === rack.modelId)?.name})</span><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div></div>
                                      <div className="grid grid-cols-2 gap-2">
                                          {rack.slots.map((slot, slotIdx) => (
                                              <div key={slotIdx} className="bg-slate-900 h-16 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden hover:border-slate-600 transition-colors">
                                                  {slot ? (
                                                      <div className="text-center w-full p-1">
                                                          <div className="text-[10px] text-blue-300 font-bold truncate">{MINERS.find(m => m.id === slot.modelId)?.name}</div>
                                                          <div className={`text-[9px] flex items-center justify-center gap-1 ${slot.condition < 50 ? 'text-red-400' : 'text-slate-500'}`}>
                                                              <BatteryCharging size={8}/> {Math.floor(slot.condition)}%
                                                          </div>
                                                          {slot.condition < 100 && (
                                                              <button onClick={(e) => { e.stopPropagation(); repairMiner(rack.instanceId, slotIdx); }} className="absolute bottom-1 right-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-1 rounded-full transition-colors">
                                                                  <Wrench size={10}/>
                                                              </button>
                                                          )}
                                                      </div>
                                                  ) : (
                                                      <button onClick={() => setSelectedRackId(rack.instanceId)} className="w-full h-full flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 gap-1"><PlusCircle size={16}/><span className="text-[9px]">Añadir</span></button>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
              {selectedRackId && (<div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"><div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-full"><h3 className="text-white font-bold mb-4">Instalar Minero</h3><div className="space-y-2 max-h-96 overflow-y-auto">{MINERS.map(miner => (<div key={miner.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => { buyMiner(miner.id, selectedRackId); setSelectedRackId(null); }}><div><div className="font-bold text-white text-sm">{miner.name}</div><div className="text-xs text-slate-500">{miner.hashrate} TH/s • {miner.power}W</div></div><div className="text-right"><div className="font-bold text-yellow-400">${miner.price}</div></div></div>))}</div><button onClick={() => setSelectedRackId(null)} className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Cancelar</button></div></div>)}
          </div>
      )}

      {showDecorator && (<div className="absolute bottom-36 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl z-40 animate-slide-up w-80 md:w-96"><div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold flex items-center gap-2"><Palette size={16}/> Personalizar</h3><button onClick={() => setShowDecorator(false)} className="text-slate-500 hover:text-white text-xs">Cerrar</button></div><div className="space-y-4"><div><span className="text-xs text-slate-400 font-bold uppercase mb-2 block">Suelo</span><div className="flex gap-3">{['#1e293b', '#3f3f46', '#57534e', '#312e81', '#7f1d1d'].map(c => (<button key={c} onClick={() => changeOfficeSkin('floor', c)} className={`w-10 h-10 rounded-full border-2 shadow-lg transition-transform hover:scale-110 ${activeSkin.floor === c ? 'border-white ring-2 ring-white/50' : 'border-white/10'}`} style={{backgroundColor: c}} />))}</div></div><div><span className="text-xs text-slate-400 font-bold uppercase mb-2 block">Paredes</span><div className="flex gap-3">{['#334155', '#1e1b4b', '#0f172a', '#27272a', '#064e3b'].map(c => (<button key={c} onClick={() => changeOfficeSkin('wall', c)} className={`w-10 h-10 rounded-full border-2 shadow-lg transition-transform hover:scale-110 ${activeSkin.wall === c ? 'border-white ring-2 ring-white/50' : 'border-white/10'}`} style={{backgroundColor: c}} />))}</div></div></div></div>)}
      
      {showArcade && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in p-4"><div className="bg-slate-900 border-4 border-purple-500 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(168,85,247,0.5)] relative"><button onClick={() => setShowArcade(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button><Gamepad2 size={64} className="text-purple-500 mx-auto mb-6 animate-bounce"/><h2 className="text-3xl font-black text-white mb-2 tracking-tighter">FLAPPY CANDLE</h2><p className="text-purple-300 text-sm mb-6">Evita las resistencias y coge los bloques.</p><div className="h-48 bg-black border-2 border-slate-700 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden group"><div className="absolute inset-0 bg-[linear-gradient(transparent_90%,#22c55e_90%)] bg-[size:20px_20px] opacity-20 animate-move-grid"></div><p className="text-green-400 font-mono text-sm bg-green-900/50 px-4 py-2 rounded border border-green-500/50">DLC Próximamente...</p></div><button onClick={() => setShowArcade(false)} className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-all">VOLVER AL TRABAJO</button></div></div>)}
    </div>
  );
};