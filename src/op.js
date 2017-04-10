import { op, logic } from "./type";

export function eq($a,$b){
	return op($a,"eq",$b);
}

export function ne($a,$b){
	return op($a,"ne",$b);
}

export function gt($a,$b){
	return op($a,"gt",$b);
}

export function lt($a,$b){
	return op($a,"lt",$b);
}

export function ge($a,$b){
	return op($a,"ge",$b);
}

export function le($a,$b){
	return op($a,"le",$b);
}

export function geq($a,$b){
	return op($a,"=",$b);
}

export function gne($a,$b){
	return op($a,"!=",$b);
}

export function ggt($a,$b){
	return op($a,">",$b);
}

export function glt($a,$b){
	return op($a,"<",$b);
}

export function gge($a,$b){
	return op($a,">=",$b);
}

export function gle($a,$b){
	return op($a,"<=",$b);
}

export function add($a,$b){
	return op($a,"+",$b);
}

export function subtract($a,$b){
	return op($a,"-",$b);
}

export function multiply($a,$b){
	return op($a,"*",$b);
}

export function div($a,$b){
	return op($a,"/",$b);
}

export function idiv($a,$b){
	return op($a,"idiv",$b);
}

export const and = logic.and;

export const or = logic.or;

export const not = logic.not;