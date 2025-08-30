// Professional IQ Test Questions with Complex Visual Patterns
const questions = [
    // Question 1: Rotation + Subtraction Matrix - 3x3 Grid
    {
        id: 1,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="matrix-grid">
                    <div class="matrix-cell">
                        <div class="matrix-shape small-square"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-triangle"></div>
                </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-circle"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-triangle"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-circle"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-square"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-circle"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-square"></div>
                    </div>
                    <div class="matrix-cell question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape completes the matrix pattern?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-triangle"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape small-square"></div>',
            '<div class="matrix-shape large-triangle"></div>'
        ],
        correct: 0,
        explanation: "The pattern combines rotation and subtraction: Each row rotates 90° clockwise from the previous row, and each subsequent shape removes one visual element. Row 1: square→triangle→circle. Row 2: triangle→circle→square (rotation + subtraction). Row 3: circle→square→triangle (rotation + subtraction). The missing piece should be triangle to complete the pattern."
    },

    // Question 2: Complex Layered Logic Matrix - 3x3 Grid
    {
        id: 2,
        category: "Advanced Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="matrix-grid">
                    <div class="matrix-cell">
                        <div class="matrix-shape small-circle"></div>
                        <div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                        </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-square"></div>
                        <div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-triangle"></div>
                        <div class="matrix-shape small-square" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                        </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-square"></div>
                        <div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-triangle"></div>
                        <div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                        </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-circle"></div>
                        <div class="matrix-shape small-square" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                    </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-triangle"></div>
                        <div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                        </div>
                    <div class="matrix-cell">
                        <div class="matrix-shape small-circle"></div>
                        <div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
                    </div>
                    <div class="matrix-cell question-mark">?</div>
                        </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape combination completes the matrix pattern?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-square"></div><div class="matrix-shape small-triangle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
            '<div class="matrix-shape small-triangle"></div><div class="matrix-shape small-square" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
            '<div class="matrix-shape small-circle"></div><div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
            '<div class="matrix-shape small-square"></div><div class="matrix-shape small-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>'
        ],
        correct: 0,
        explanation: "This matrix uses THREE layered logical operations: 1) ROW RULE: Each row follows a 3-step rotation (circle→square→triangle) for the background shape. 2) COLUMN RULE: Each column follows a 3-step rotation (triangle→circle→square) for the overlay shape. 3) INTERSECTION RULE: The overlay shape is always the NEXT shape in the background's rotation sequence. Row 3: background=triangle→circle→square, overlay=circle→square→triangle. The missing piece needs background=square with overlay=triangle (next in square's rotation)."
    },

    // Question 3: Grid Pattern - Cross Design
    {
        id: 3,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="grid-container">
                    <div class="grid-row">
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell filled"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell filled"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell filled"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell empty"></div>
                        <div class="grid-cell filled"></div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                        <div class="grid-cell filled"></div>
                    </div>
                    </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which pattern completes the cross design?</p>
            </div>
        `,
        options: [
            '<div class="grid-option small-grid"></div>',
            '<div class="grid-option diamond-grid"></div>',
            '<div class="grid-option cross-hatch"></div>',
            '<div class="grid-option hash-pattern"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows a frame with a cross in the center, so the missing piece should have filled corners and empty center with a cross pattern."
    },

    // Question 4: Color Sequence Pattern
    {
        id: 4,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="color-item red"></div>
                    <div class="color-item blue"></div>
                    <div class="color-item green"></div>
                    <div class="color-item yellow"></div>
                    <div class="color-item red"></div>
                    <div class="color-item blue"></div>
                    <div class="question-mark">?</div>
                    </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">What color comes next?</p>
            </div>
        `,
        options: [
            '<div class="color-item green"></div>',
            '<div class="color-item yellow"></div>',
            '<div class="color-item red"></div>',
            '<div class="color-item blue"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 4 colors: Red → Blue → Green → Yellow, repeating every 4 colors."
    },

    // Question 5: Complex Shape Transformation
    {
        id: 5,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="shape triangle"></div>
                    <div class="shape diamond"></div>
                    <div class="shape square"></div>
                    <div class="shape circle"></div>
                    <div class="shape triangle"></div>
                    <div class="shape diamond"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">What shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="shape square"></div>',
            '<div class="shape circle"></div>',
            '<div class="shape triangle"></div>',
            '<div class="shape diamond"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 4 shapes: Triangle → Diamond → Square → Circle, repeating every 4 shapes."
    },

    // Question 6: Fill Pattern Sequence
    {
        id: 6,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="fill-shape empty"></div>
                    <div class="fill-shape quarter"></div>
                    <div class="fill-shape half"></div>
                    <div class="fill-shape three-quarter"></div>
                    <div class="fill-shape full"></div>
                    <div class="fill-shape dotted"></div>
                    <div class="question-mark">?</div>
                    </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which fill pattern comes next?</p>
            </div>
        `,
        options: [
            '<div class="fill-shape empty"></div>',
            '<div class="fill-shape quarter"></div>',
            '<div class="fill-shape half"></div>',
            '<div class="fill-shape three-quarter"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 6 fill patterns, so the 7th should be empty again."
    },

    // Question 7: Circle Pattern Sequence
    {
        id: 7,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>',
            '<div class="matrix-shape small-square"></div>',
            '<div class="matrix-shape large-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large circles, so the next should be small-circle."
    },

    // Question 8: Square Pattern Sequence
    {
        id: 8,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-square"></div>',
            '<div class="matrix-shape large-square"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large squares, so the next should be small-square."
    },

    // Question 9: Triangle Pattern Sequence
    {
        id: 9,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-triangle"></div>',
            '<div class="matrix-shape large-triangle"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large triangles, so the next should be small-triangle."
    },

    // Question 10: Diamond Pattern Sequence
    {
        id: 10,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-diamond"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-diamond"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-diamond"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-diamond"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large diamonds, so the next should be small-diamond."
    },

    // Question 11: Mixed Shape Pattern
    {
        id: 11,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape small-diamond"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape large-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape small-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, small-square, small-triangle, small-diamond, large-circle, large-square, so next should be large-triangle."
    },

    // Question 12: Size Alternating Pattern
    {
        id: 12,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large shapes, so the next should be small-triangle."
    },

    // Question 13: Shape Type Pattern
    {
        id: 13,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-diamond"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, large-circle, small-square, large-square, small-triangle, large-triangle, so next should be small-diamond."
    },

    // Question 14: Complex Pattern Sequence
    {
        id: 14,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape large-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape small-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, small-square, large-triangle, large-diamond, small-circle, small-square, so next should be large-triangle."
    },

    // Question 15: Advanced Pattern Sequence
    {
        id: 15,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large shapes, so the next should be small-triangle."
    },

    // Question 16: Complex Alternating Pattern
    {
        id: 16,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="question-mark">?</div>
                    </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape large-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape small-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, small-square, large-triangle, large-diamond, small-circle, small-square, so next should be large-triangle."
    },

    // Question 17: Shape Progression Pattern
    {
        id: 17,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-diamond"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, large-circle, small-square, large-square, small-triangle, large-triangle, so next should be small-diamond."
    },

    // Question 18: Angle Pattern Sequence
    {
        id: 18,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="angle-shape acute"></div>
                    <div class="angle-shape right"></div>
                    <div class="angle-shape obtuse"></div>
                    <div class="angle-shape straight"></div>
                    <div class="angle-shape acute"></div>
                    <div class="angle-shape right"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which angle comes next?</p>
            </div>
        `,
        options: [
            '<div class="angle-shape acute"></div>',
            '<div class="angle-shape right"></div>',
            '<div class="angle-shape obtuse"></div>',
            '<div class="angle-shape straight"></div>'
        ],
        correct: 2,
        explanation: "The pattern shows: acute, right, obtuse, straight, acute, right, so next should be obtuse."
    },

    // Question 19: Advanced Shape Pattern
    {
        id: 19,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large shapes, so the next should be small-triangle."
    },

    // Question 20: Complex Shape Pattern
    {
        id: 20,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape large-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape small-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, small-square, large-triangle, large-diamond, small-circle, small-square, so next should be large-triangle."
    },

    // Question 21: Shape Alternating Pattern
    {
        id: 21,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-circle"></div>
                    <div class="matrix-shape small-square"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-triangle"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-diamond"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-circle"></div>'
        ],
        correct: 0,
        explanation: "The pattern shows: small-circle, large-circle, small-square, large-square, small-triangle, large-triangle, so next should be small-diamond."
    },

    // Question 22: Mixed Size Pattern
    {
        id: 22,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="matrix-shape small-triangle"></div>
                    <div class="matrix-shape large-diamond"></div>
                    <div class="matrix-shape small-circle"></div>
                    <div class="matrix-shape large-square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="matrix-shape small-triangle"></div>',
            '<div class="matrix-shape large-diamond"></div>',
            '<div class="matrix-shape small-circle"></div>',
            '<div class="matrix-shape large-square"></div>'
        ],
        correct: 0,
        explanation: "The pattern alternates between small and large shapes, so the next should be small-triangle."
    },

    // Question 23: Pattern Memory Pattern Sequence
    {
        id: 23,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="pattern-memory dots"></div>
                    <div class="pattern-memory stripes"></div>
                    <div class="pattern-memory checks"></div>
                    <div class="pattern-memory waves"></div>
                    <div class="pattern-memory dots"></div>
                    <div class="pattern-memory stripes"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which pattern memory comes next?</p>
            </div>
        `,
        options: [
            '<div class="pattern-memory dots"></div>',
            '<div class="pattern-memory stripes"></div>',
            '<div class="pattern-memory checks"></div>',
            '<div class="pattern-memory waves"></div>'
        ],
        correct: 2,
        explanation: "The pattern shows: dots, stripes, checks, waves, dots, stripes, so next should be checks."
    },

    // Question 24: Fold Pattern Sequence
    {
        id: 24,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="fold-shape unfolded"></div>
                    <div class="fold-shape half-folded"></div>
                    <div class="fold-shape folded"></div>
                    <div class="fold-shape twisted"></div>
                    <div class="fold-shape double-folded"></div>
                    <div class="fold-shape reverse-folded"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which fold pattern comes next?</p>
            </div>
        `,
        options: [
            '<div class="fold-shape unfolded"></div>',
            '<div class="fold-shape half-folded"></div>',
            '<div class="fold-shape folded"></div>',
            '<div class="fold-shape twisted"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 6 fold patterns, so the 7th should be unfolded again."
    },

    // Question 25: Perspective Pattern Sequence
    {
        id: 25,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="perspective-shape front-view"></div>
                    <div class="perspective-shape side-view"></div>
                    <div class="perspective-shape top-view"></div>
                    <div class="perspective-shape corner-view"></div>
                    <div class="perspective-shape bottom-view"></div>
                    <div class="perspective-shape diagonal-view"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which perspective comes next?</p>
            </div>
        `,
        options: [
            '<div class="perspective-shape front-view"></div>',
            '<div class="perspective-shape side-view"></div>',
            '<div class="perspective-shape top-view"></div>',
            '<div class="perspective-shape corner-view"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 6 perspectives, so the 7th should be front-view again."
    },

    // Question 26: Mirror Pattern Sequence
    {
        id: 26,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="mirror-shape normal"></div>
                    <div class="mirror-shape flipped"></div>
                    <div class="mirror-shape rotated"></div>
                    <div class="mirror-shape inverted"></div>
                    <div class="mirror-shape scaled"></div>
                    <div class="mirror-shape skewed"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which mirror pattern comes next?</p>
            </div>
        `,
        options: [
            '<div class="mirror-shape normal"></div>',
            '<div class="mirror-shape flipped"></div>',
            '<div class="mirror-shape rotated"></div>',
            '<div class="mirror-shape inverted"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 6 mirror patterns, so the 7th should be normal again."
    },

    // Question 27: Transform Pattern Sequence
    {
        id: 27,
        category: "Pattern Recognition",
        type: "visual",
        question: `
            <div class="pattern-question">
                <div class="sequence-row">
                    <div class="transform-shape circle"></div>
                    <div class="transform-shape oval"></div>
                    <div class="transform-shape rectangle"></div>
                    <div class="transform-shape triangle"></div>
                    <div class="transform-shape diamond"></div>
                    <div class="transform-shape square"></div>
                    <div class="question-mark">?</div>
                </div>
                <p style="text-align: center; margin-top: 1rem; font-weight: 600;">Which transform shape comes next?</p>
            </div>
        `,
        options: [
            '<div class="transform-shape circle"></div>',
            '<div class="transform-shape oval"></div>',
            '<div class="transform-shape rectangle"></div>',
            '<div class="transform-shape triangle"></div>'
        ],
        correct: 0,
        explanation: "The pattern cycles through 6 transform shapes, so the 7th should be circle again."
    },

    // Question 28: Logical Reasoning - Number Sequence
    {
        id: 28,
        category: "Logical Reasoning",
        type: "text",
        question: "What comes next in the sequence: 2, 4, 8, 16, 32, ?",
        options: ["48", "56", "64", "72"],
        correct: 2,
        explanation: "Each number is multiplied by 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64"
    },

    // Question 29: Logical Reasoning - Letter Sequence
    {
        id: 29,
        category: "Logical Reasoning",
        type: "text",
        question: "What comes next in the sequence: A, C, E, G, I, ?",
        options: ["J", "K", "L", "M"],
        correct: 1,
        explanation: "The sequence skips one letter each time: A, (skip B), C, (skip D), E, (skip F), G, (skip H), I, (skip J), K"
    },

    // Question 30: Logical Reasoning - Word Pattern
    {
        id: 30,
        category: "Logical Reasoning",
        type: "text",
        question: "Complete the analogy: Cat is to Kitten as Dog is to ?",
        options: ["Puppy", "Cub", "Chick", "Foal"],
        correct: 0,
        explanation: "A kitten is a young cat, and a puppy is a young dog."
    },

    // Question 31: Logical Reasoning - Mathematical Pattern
    {
        id: 31,
        category: "Logical Reasoning",
        type: "text",
        question: "What comes next in the sequence: 1, 3, 6, 10, 15, ?",
        options: ["18", "20", "21", "25"],
        correct: 2,
        explanation: "The difference between consecutive terms increases by 1: +2, +3, +4, +5, +6, so 15+6=21"
    },

    // Question 32: Logical Reasoning - Color Logic
    {
        id: 32,
        category: "Logical Reasoning",
        type: "text",
        question: "If all roses are flowers and some flowers are red, which statement is definitely true?",
        options: ["All roses are red", "Some roses are red", "No roses are red", "All red things are roses"],
        correct: 1,
        explanation: "Since all roses are flowers and some flowers are red, it's possible that some roses are red."
    },

    // Question 33: Logical Reasoning - Spatial Reasoning
    {
        id: 33,
        category: "Logical Reasoning",
        type: "text",
        question: "If you fold a piece of paper in half twice, how many layers will you have?",
        options: ["2", "3", "4", "8"],
        correct: 2,
        explanation: "First fold: 2 layers, second fold: 4 layers (each of the 2 layers becomes 2)."
    },

    // Question 34: Logical Reasoning - Pattern Recognition
    {
        id: 34,
        category: "Logical Reasoning",
        type: "text",
        question: "What comes next in the sequence: 1, 1, 2, 3, 5, 8, ?",
        options: ["10", "11", "12", "13"],
        correct: 3,
        explanation: "This is the Fibonacci sequence where each number is the sum of the two preceding ones: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13"
    },

    // Question 35: Logical Reasoning - Deductive Reasoning
    {
        id: 35,
        category: "Logical Reasoning",
        type: "text",
        question: "If all A are B, and all B are C, then:",
        options: ["All C are A", "All A are C", "Some C are A", "No C are A"],
        correct: 1,
        explanation: "If all A are B and all B are C, then all A must be C (transitive property)."
    },

    // Question 36: Logical Reasoning - Inductive Reasoning
    {
        id: 36,
        category: "Logical Reasoning",
        type: "text",
        question: "If every time it rains, the ground gets wet, and the ground is wet, then:",
        options: ["It definitely rained", "It might have rained", "It definitely didn't rain", "We can't tell"],
        correct: 1,
        explanation: "The ground being wet doesn't necessarily mean it rained - there could be other causes like sprinklers or dew."
    },

    // Question 37: Logical Reasoning - Abstract Reasoning
    {
        id: 37,
        category: "Logical Reasoning",
        type: "text",
        question: "If X represents 5 and Y represents 10, what does XX + Y equal?",
        options: ["15", "20", "25", "30"],
        correct: 1,
        explanation: "XX = 5 + 5 = 10, Y = 10, so XX + Y = 10 + 10 = 20"
    },

    // Question 38: Logical Reasoning - Critical Thinking
    {
        id: 38,
        category: "Logical Reasoning",
        type: "text",
        question: "Which statement is logically equivalent to 'If it's raining, then I'll stay home'?",
        options: ["If I stay home, then it's raining", "If I don't stay home, then it's not raining", "If it's not raining, then I won't stay home", "I'll stay home only if it's raining"],
        correct: 1,
        explanation: "The contrapositive of 'If P then Q' is 'If not Q then not P', which is logically equivalent."
    },

    // Question 39: Logical Reasoning - Problem Solving
    {
        id: 39,
        category: "Logical Reasoning",
        type: "text",
        question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
        options: ["7.5°", "15°", "22.5°", "30°"],
        correct: 0,
        explanation: "At 3:15, the hour hand is 1/4 of the way between 3 and 4 (7.5° from 3), and the minute hand is at 3 (90°). The angle is 90° - 7.5° = 82.5°, but since we want the smaller angle, it's 7.5°."
    },

    // Question 40: Logical Reasoning - Final Challenge
    {
        id: 40,
        category: "Logical Reasoning",
        type: "text",
        question: "If a train travels 60 miles in 1 hour, how far will it travel in 45 minutes?",
        options: ["40 miles", "45 miles", "50 miles", "55 miles"],
        correct: 1,
        explanation: "60 miles per hour = 1 mile per minute, so in 45 minutes it travels 45 miles."
    }
];

// Categories for analysis
const categories = [
    "Pattern Recognition",
    "Spatial Awareness", 
    "Logical Reasoning",
    "Mathematical Ability",
    "Visual Memory"
];

// Helper functions for results calculation
function calculateIQ(correctAnswers, totalQuestions) {
    // Calculate percentage
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    // Base IQ calculation (simplified)
    const baseIQ = 100;
    const standardDeviation = 15;
    
    // Convert percentage to IQ score using normal distribution
    // Assuming 50% = 100 IQ, with standard deviation of 15
    const zScore = (percentage - 50) / 20; // 20% = 1 standard deviation
    const iq = Math.round(baseIQ + (zScore * standardDeviation));
    
    return Math.max(70, Math.min(130, iq)); // Clamp between 70-130
}

function getIQRange(iq) {
    if (iq >= 130) return "Very Superior";
    if (iq >= 120) return "Superior";
    if (iq >= 110) return "Above Average";
    if (iq >= 90) return "Average";
    if (iq >= 80) return "Below Average";
    return "Low";
}

function calculateCategoryScores(answers) {
    const categoryScores = {};
    
    answers.forEach((answer, index) => {
        if (answer !== null && answer === questions[index].correct) {
            const category = questions[index].category;
            if (!categoryScores[category]) {
                categoryScores[category] = 0;
            }
            categoryScores[category]++;
        }
    });
    
    // Convert to percentages
    const totalQuestions = questions.length;
    Object.keys(categoryScores).forEach(category => {
        const categoryQuestions = questions.filter(q => q.category === category).length;
        categoryScores[category] = Math.round((categoryScores[category] / categoryQuestions) * 100);
    });
    
    return categoryScores;
}

function generateRecommendations(iq, categoryScores) {
    const recommendations = [];
    
    // IQ-based recommendations
    if (iq >= 120) {
        recommendations.push("Consider advanced problem-solving challenges");
        recommendations.push("Explore complex pattern recognition tasks");
    } else if (iq >= 100) {
        recommendations.push("Practice spatial reasoning exercises");
        recommendations.push("Work on mathematical pattern recognition");
    } else {
        recommendations.push("Focus on basic pattern recognition exercises");
        recommendations.push("Practice visual memory techniques");
    }
    
    // Category-based recommendations
    Object.entries(categoryScores).forEach(([category, score]) => {
        if (score < 70) {
            recommendations.push(`Improve ${category.toLowerCase()} through targeted exercises`);
        }
    });
    
    return recommendations;
} 