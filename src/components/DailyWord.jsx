function DailyWord({ word, layout = 'panel' }) {
  const letters = String(word || '').toUpperCase();
  return (
    <div className={`daily-word daily-word-${layout}`}>
      <p className="daily-word-kicker">WORD OF THE DAY</p>
      <p className="daily-word-letters">{letters}</p>
      {layout === 'panel' && (
        <p className="daily-word-note">
          Clear it the most times.
          <br />
          Other words still clear.
        </p>
      )}
    </div>
  );
}

export default DailyWord;
