// Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.
// http://softsurfer.com/Archive/algorithm_0203/algorithm_0203.htm
// Assume that a class is already given for the object:
//    Point with coordinates {float x, y;}
//===================================================================

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2 on the line
//            <0 for P2 right of the line
import {IClickPos} from "./Interface";

function sortPointX(a : IClickPos, b : IClickPos) {
    return a.X - b.X
}
function sortPointY(a : IClickPos, b : IClickPos) {
    return a.Y - b.Y;
}

function isLeft(P0 : IClickPos, P1 : IClickPos, P2 : IClickPos) {    
    return (P1.X - P0.X) * (P2.Y - P0.Y) - (P2.X - P0.X) * (P1.Y - P0.Y);
}
//===================================================================

// chainHull_2D(): A.M. Andrew's monotone chain 2D convex hull algorithm
// http://softsurfer.com/Archive/algorithm_0109/algorithm_0109.htm
// 
//     Input:  P[] = an array of 2D points 
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]


export default  function ConvexHull_2D(P : IClickPos[]) {
    // the output array H[] will be used as the stack3
    
    let H : IClickPos[] = [];
    let n = P.length;
    let bot = 0,
    top = (-1); // indices for bottom and top of the stack
    let i; // array scan index
    // Get the indices of points with min x-coord and min|max y-coord
    let minmin = 0,
        minmax;

    P.sort(sortPointY);
    P.sort(sortPointX);
    
    let xmin = P[0].X;
    for (i = 1; i < n; i++) {
        if (P[i].X != xmin) {
            break;
        }
    }
    minmax = i - 1;
    if (minmax == n - 1) { // degenerate case: all x-coords == xmin 
        H[++top] = P[minmin];
        if (P[minmax].Y != P[minmin].Y) // a nontrivial segment
            H[++top] = P[minmax];
        H[++top] = P[minmin]; // add polygon endpoint
        return H;
    }

    // Get the indices of points with max x-coord and min|max y-coord
    let maxmin, maxmax = n - 1;
    let xmax = P[n - 1].X;
    for (i = n - 2; i >= 0; i--) {
        if (P[i].X != xmax) {
            break; 
        }
    }
    maxmin = i + 1;

    // Compute the lower hull on the stack H
    H[++top] = P[minmin]; // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin) {
        // the lower line joins P[minmin] with P[maxmin]
        if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin) {
            continue; // ignore P[i] above or on the lower line
        }
        
        while (top > 0) { // there are at least 2 points on the stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                break; // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }
        
        H[++top] = P[i]; // push P[i] onto stack
    }

    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin) { // if distinct xmax points
        H[++top] = P[maxmax]; // push maxmax point onto stack
    }
    
    bot = top; // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax) {
        // the upper line joins P[maxmax] with P[minmax]
        if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax) {
            continue; // ignore P[i] below or on the upper line
        }
        
        while (top > bot) { // at least 2 points on the upper stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) { 
                break;  // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }
        
        if (P[i].X == H[0].X && P[i].Y == H[0].Y) {
            return H; // special case (mgomes)
        }
        
        H[++top] = P[i]; // push P[i] onto stack
    }
    
    if (minmax != minmin) {
        H[++top] = P[minmin]; // push joining endpoint onto stack
    }
    
    return H;
}