import React, { useEffect, useState } from 'react'
import Carditem from './Carditem';


function Card() {
    const [card, setCard] = useState([])
    const [targetId, setTargetId] = useState(4);
    const [level, setLevel] = useState('Easy');
    const [flippedcards, setFlippedcards] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [showall, setShowall] = useState(false);
    const [cardback, setCardback] = useState(1);
    const [result, setResult] = useState('Result:');
    const [trycount, setTrycount] = useState(3);
    const [revealcount, setRevealcount] = useState(1);
    const [score, setScore] = useState(0);
    const [highscore, setHighscore] = useState(() => {
        return Number(localStorage.getItem('highscore')) || 0;
    });
    const [totalscore, setTotalscore] = useState(0);
    const [scorelevel, setScorelevel] = useState(0);


    // Shuffle function
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    //fething the data from the json file in public folder
    const fetchData = async (id) => {
        try {
            if (targetId === 4) {
                setLevel('Easy')
                setTrycount(2)
                setRevealcount(1)
                setScorelevel(5)
            } else if (targetId === 8) {
                setLevel('Medium')
                setTrycount(3)
                setRevealcount(2)
                setScorelevel(10)
            } else {
                setLevel('Hard')
                setTrycount(4)
                setRevealcount(3)
                setScorelevel(15)
            }
            const response = await fetch(`${process.env.PUBLIC_URL}/cards.json`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            //logic to make pair of the cards
            const newdata = data.slice(0, targetId)
            if (Array.isArray(newdata)) {
                const paired = newdata.flatMap(card => [
                    { ...card, uid: `${card.id}-a` },
                    { ...card, uid: `${card.id}-b` }
                ]);

                const shuffled = shuffleArray(paired);
                setCard(shuffled);
            } else {
                setCard([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setCard('Error loading data.');
        }
    };

    useEffect(() => {
        fetchData(targetId);
        setFlippedcards([])
        setMatchedIds([])
        // eslint-disable-next-line
    }, [targetId]);


    const handleClick = (uid) => {
        const clickedcard = card.find(card => card.uid === uid);

        //check the card is flipped or not if teo ards are flipped then stop and prevent again same card click and already card clicked
        if (flippedcards.length === 2 || flippedcards.includes(uid) || matchedIds.includes(clickedcard.id)) {
            return; // Prevent extra clicks
        }
        //flipping the card
        const newFlipped = [...flippedcards, uid];
        setFlippedcards(newFlipped);

        //finding the first and seond card form fillped cards
        if (newFlipped.length === 2) {
            const [first, second] = newFlipped;
            const firstCard = card.find(c => c.uid === first)
            const secondCard = card.find(c => c.uid === second)

            //matching the card
            if (firstCard.id === secondCard.id) {
                const newScore = totalscore + scorelevel;

                //managing score
                setScore(prevId => prevId + scorelevel)
                setTotalscore(newScore);

                //set the card in matched id to prevent from flipping
                const newMatchedIds = [...matchedIds, firstCard.id];
                setMatchedIds(newMatchedIds);
                setTimeout(() => {
                    setResult('Card Matched')
                    resetResult();
                    setFlippedcards([]);

                    //use when all cards are flipped and then reload th new puzzle
                    if (card.length === newMatchedIds.length * 2) {

                        //set high score
                        if (newScore >= highscore) {
                            setHighscore(newScore);
                            localStorage.setItem('highscore', newScore);
                        }
                        handleReload();
                    }
                }, 500);

            }
            else {
                setResult('Card not Matched')
                resetResult();
                // No match — flip back after 1 second
                setTimeout(() => {
                    if (trycount <= 1) {
                        fetchData(targetId);
                        setFlippedcards([])
                        setMatchedIds([])
                        setTotalscore(0);
                        alert('You lose new game')
                    } else {
                        setTrycount(prevId => prevId - 1)
                        setFlippedcards([]);
                    }
                }, 1000);
            }

        }

    }
    //checking which card is not flipped and which is flipped here matched cards are not flipped
    const isCardflipped = (uid) => {
        const cardData = card.find(c => c.uid === uid);
        return showall || flippedcards.includes(uid) || matchedIds.includes(cardData?.id);
    }
    //next puzzle shown when button is clicked
    const handleClicknext = () => {
        setTargetId(prevId => prevId + 4);
    };

    //previous puzzle shown when button is clicked
    const handleClickprevious = () => {
        setTargetId(prevId => prevId - 4);
    };
    //Reveal all the cards for 2 second on button clicked
    const handleReveal = () => {
        const allcardsids = card.map(c => c.uid)
        setFlippedcards(allcardsids) //flip everything

        setShowall(true)
        setRevealcount(prevId => prevId - 1);

        setTimeout(() => {
            setFlippedcards([])
            setShowall(false)

        }, 1500);
        setResult('Card Reveled For 2s')
        resetResult();
    };

    //Reset the existing card means facing downward all the cards if some matched on button clicked
    const handleReset = () => {
        setMatchedIds([]);
        setFlippedcards([])
        setResult('Game Reset Successfully')
        resetResult();
        setScore(0);
        if (targetId === 4) {
            setTrycount(2)
            setRevealcount(1)
        } else if (targetId === 8) {
            setTrycount(3)
            setRevealcount(2)
        } else {
            setTrycount(4)
            setRevealcount(3)
        }
    };
    //fuction to reset the result
    const resetResult = () => {
        setTimeout(() => {
            setResult('Result:')
        }, 2000);
    }
    //reload funtion reload all the new cards with current targed id means new puzzle
    const handleReload = () => {
        setMatchedIds([]);
        setFlippedcards([]);
        fetchData(targetId)
        setScore(0)
        setResult('New Puzzle Reloaded')
        resetResult();
    };
    //changing the card back design previous design
    const handleClickprevious2 = () => {
        setCardback(prevId => prevId - 1);
    }
    //changing the card back design next design
    const handleClicknext2 = () => {
        setCardback(prevId => prevId + 1);
    }
    return (
        <div className="jumbo">
            <div className="content">
                <h3>Card Matching Puzzle</h3>
                <div className="result" aria-live="polite">{result}</div>
                <div className="result">Total Score: {totalscore}</div>
                <div className="result">High Score: {highscore}</div>
            </div>
            <div className="mycontainer">
                <div className="box1">
                    <div className="puzzle">
                        {card.map((card) => (
                            <div role="gridcell" className="col-md-4" key={card.uid}>
                                <Carditem image={card.image} cardback={cardback} id={card.uid} isFlipped={isCardflipped(card.uid)} handleClick={handleClick} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="box2">
                    <div className="b1"><h4>Select Difficulty</h4></div>
                    <div className="b1">
                        <button className="btn btn-secondary mx-3" disabled={targetId <= 4} onClick={handleClickprevious}>&larr;</button>
                        <button className='btn btn-primary' disabled>{level}</button>
                        <button className="btn btn-secondary mx-3" disabled={targetId >= 12} onClick={handleClicknext}>&rarr;</button>
                    </div>
                    <div className="b1"><h4>Game Statistics</h4></div>
                    <div className="b1">
                        <button className='btn btn-primary' disabled>Score: {score}</button>
                        <button className='btn btn-primary mx-2' disabled>Reveal Left: {revealcount}</button>
                        <button className='btn btn-primary' disabled>Try Left: {trycount}</button>
                    </div>
                    <div className="b1"><h4>Game Modes</h4></div>
                    <div className="b1">
                        <button className="btn btn-secondary mx-3" disabled={revealcount <= 0} onClick={handleReveal}>Reveal</button>
                        <button className="btn btn-secondary mx-3" onClick={handleReset}>Reset</button>
                        <button className="btn btn-secondary mx-3" onClick={handleReload}>Reload</button>
                    </div>
                    <div className="b1"><h4>Change Design</h4></div>
                    <div className="b1">
                        <button className='btn btn-primary mx-3' disabled>Card Back</button>
                        <button className="btn btn-secondary mx-1" disabled={cardback <= 1} onClick={handleClickprevious2}>&larr;</button>
                        <button className="btn btn-secondary mx-1" disabled={cardback >= 10} onClick={handleClicknext2}>&rarr;</button>
                    </div>
                    <div className="b2">Develop By:_ <a target='blank' href="https://instagram.com/ch_ehtsham__ "> Ch Ehtsham</a></div>
                </div>
            </div>
        </div>
    )
}

export default Card

