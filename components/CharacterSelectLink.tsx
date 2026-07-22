import { FaMagnifyingGlass } from "react-icons/fa6";
import Link from "next/link";
import styles from "./CharacterSelectLink.module.css";

export default function CharacterSelectLink() {
  return (
    <Link href="/characters/select" className={styles.button}>
      <FaMagnifyingGlass aria-hidden="true" className={styles.icon} />
      Select character
    </Link>
  );
}
