# react-native-pan-zoom-rotate

While playing with react-native and image animation, I did not find any react-native package that provides a clean way to pan, zoom and rotate an image with two fingers all at once.

Therefore I made it myself.

## Demo

<div align="center">
<video src='https://user-images.githubusercontent.com/83889377/224850135-faab3d9f-2ada-4b17-9745-ba0f80cc21ca.mp4' />
</div>

## Technology used

I used React Native and Expo to easily create a ready to use environment.
No external packages used, only vanilla React Native and a little bit of mathematics.

## Inspiration

The way this code behave is very similar to the way you can navigate through the plan from the Google Maps mobile application.<br>
To make it simple, the problem is the following:

Having two fingers on the screen is like selecting two pixels of my image.<br>
When I move them, I want these pixels to follow the exact positions of my fingers.

## Mathematical definition

Let's consider:
- 2 points A and B, with respective affixes `(Xa,Ya)` and `(Xb,Yb)`.
- 2 points A' and B', with respective affixes `(Xa', Ya')` and `(Xb',Yb')`.

I want to find all the parameters that define the exact 2D plan transformation related to the movement of the points A and B to the points A' and B' respectively.

## Explanation of the solution

### Introduction

Every transformation of a 2D plan can be decomposed into 3 elementary transformations:
- 1 translation, defined with the coordinates `(Tx, Ty)`
- 1 homothety, defined with a factor named `k`
- 1 rotation, defined with an angle named `θ`

_Note: we consider that the rotation and the homothety as centered in the origin, as the translation can compensate for this._

With these parameters, we can write down the matricial equation that defines our transformation:
<img height=100 src='https://user-images.githubusercontent.com/83889377/224843025-91af6ca7-241a-44fe-affe-06f3e059abb1.png' />

### Solving for `Tx`, `Ty`, `k` and `θ`

Applying the formula to our points A, B, setting them equal to A' and B', we get the following system of equations:

![image](https://user-images.githubusercontent.com/83889377/224844811-2eb04e47-bfd0-4b13-b5e1-b49f1a02a72d.png)

We know that `k` is the ratio of `||A'B'||` and `||AB||`.
With basic equations manipulation, we get the following results:

<img width=500 src='https://user-images.githubusercontent.com/83889377/224847254-e6b7b9ed-2074-48df-9841-a4686970c0a4.png' />

All that we have left to do is plug these values in our code and have fun! :D

